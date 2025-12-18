const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const School = require('../models/School');
const FaceEncoding = require('../models/FaceEncoding');
const { default: axios } = require('axios');
const mongoose = require('mongoose');

// @desc    Mark attendance for a class
// @route   POST /api/attendance/mark
// @access  Private/Teacher
const markAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceData, recognitionResults, mode } = req.body;
    const markedBy = req.user._id;
    const schoolId = req.user.school;

    // Validate class
    const studentClass = await Class.findOne({
      _id: classId,
      school: schoolId,
    });

    if (!studentClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or not authorized',
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const results = {
      success: 0,
      failed: 0,
      details: [],
    };

    // Process each student attendance
    for (const item of attendanceData) {
      try {
        const { studentId, status, checkInTime, remarks, confidenceScore } = item;

        // Verify student belongs to the class and school
        const student = await Student.findOne({
          _id: studentId,
          class: classId,
          school: schoolId,
          isActive: true,
        });

        if (!student) {
          results.failed++;
          results.details.push({
            studentId,
            status: 'failed',
            reason: 'Student not found or not in class',
          });
          continue;
        }

        // Check if attendance already marked for today
        const existingAttendance = await Attendance.findOne({
          student: studentId,
          date: attendanceDate,
        });

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status;
          existingAttendance.markedBy = markedBy;
          existingAttendance.markedAt = new Date();
          existingAttendance.recognitionMethod = mode || 'manual';
          existingAttendance.confidenceScore = confidenceScore;
          existingAttendance.checkInTime = checkInTime ? new Date(checkInTime) : undefined;
          existingAttendance.remarks = remarks;

          await existingAttendance.save();
        } else {
          // Create new attendance record
          await Attendance.create({
            student: studentId,
            class: classId,
            school: schoolId,
            date: attendanceDate,
            status,
            markedBy,
            recognitionMethod: mode || 'manual',
            confidenceScore,
            checkInTime: checkInTime ? new Date(checkInTime) : undefined,
            remarks,
            syncStatus: 'synced',
          });
        }

        // Update student attendance stats
        await updateStudentAttendanceStats(studentId);

        results.success++;
        results.details.push({
          studentId,
          studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
          rollNumber: student.rollNumber,
          status: 'success',
          attendanceStatus: status,
        });

      } catch (error) {
        console.error(`Error marking attendance for student ${item.studentId}:`, error);
        results.failed++;
        results.details.push({
          studentId: item.studentId,
          status: 'failed',
          reason: error.message,
        });
      }
    }

    // Process recognition results for face registration updates
    if (recognitionResults && Array.isArray(recognitionResults)) {
      await processRecognitionResults(recognitionResults, schoolId);
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully. Success: ${results.success}, Failed: ${results.failed}`,
      data: results,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking attendance',
    });
  }
};

// @desc    Process recognition results and update face registration
const processRecognitionResults = async (results, schoolId) => {
  for (const result of results) {
    if (result.studentId && result.confidenceScore > 0.7) {
      await Student.findByIdAndUpdate(result.studentId, {
        faceRegistered: true,
        lastFaceUpdate: new Date(),
      });
    }
  }
};

// @desc    Update student attendance statistics
const updateStudentAttendanceStats = async (studentId) => {
  const stats = await Attendance.aggregate([
    {
      $match: {
        student: new mongoose.Types.ObjectId(studentId),
        status: { $in: ['present', 'absent', 'late'] },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalRecords = 0;

  stats.forEach((stat) => {
    if (stat._id === 'present' || stat._id === 'late') {
      totalPresent += stat.count;
    } else if (stat._id === 'absent') {
      totalAbsent += stat.count;
    }
    totalRecords += stat.count;
  });

  const attendancePercentage = totalRecords > 0
    ? Math.round((totalPresent / totalRecords) * 100)
    : 0;

  await Student.findByIdAndUpdate(studentId, {
    'attendanceStats.totalPresent': totalPresent,
    'attendanceStats.totalAbsent': totalAbsent,
    'attendanceStats.attendancePercentage': attendancePercentage,
  });
};

// @desc    Get attendance for a class on specific date
// @route   GET /api/attendance/class/:classId/date/:date OR GET /api/attendance/daily
// @access  Private
const getClassAttendance = async (req, res) => {
  try {
    // Support both params and query
    const classId = req.params.classId || req.query.classId;
    const date = req.params.date || req.query.date || new Date().toISOString().split('T')[0];
    const schoolId = req.user?.school;

    // Build query for attendance
    const attendanceQuery = {
      date: new Date(date),
    };

    // If classId provided, filter by class
    if (classId) {
      // Verify class belongs to school
      const studentClass = await Class.findOne({
        _id: classId,
        ...(schoolId ? { school: schoolId } : {}),
      });

      if (!studentClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found or not authorized',
        });
      }
      attendanceQuery.class = classId;
    } else if (schoolId) {
      // Filter by school if no classId
      attendanceQuery.school = schoolId;
    }

    // Get attendance records for the date
    const attendanceRecords = await Attendance.find(attendanceQuery)
      .populate('student', 'firstName lastName rollNumber')
      .populate('class', 'name grade section');

    // If no records, return empty array with success
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No attendance records found for this date',
      });
    }

    // Format response
    const attendanceData = attendanceRecords.map((record) => ({
      _id: record._id,
      student: record.student,
      class: record.class,
      date: record.date,
      status: record.status,
      confidence: record.confidenceScore,
      recognizedBy: record.recognitionMethod,
      createdAt: record.createdAt || record.markedAt,
      markedBy: record.markedBy,
      remarks: record.remarks,
    }));

    res.status(200).json({
      success: true,
      data: attendanceData,
    });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance',
    });
  }
};

// @desc    Get attendance history for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;
    const schoolId = req.user.school;

    // Verify student belongs to school
    const student = await Student.findOne({
      _id: studentId,
      school: schoolId,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not authorized',
      });
    }

    const query = {
      student: studentId,
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('class', 'name grade section')
      .populate('markedBy', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const summary = await Attendance.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          status: { $in: ['present', 'absent', 'late', 'leave'] },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDays = summary.reduce((total, item) => total + item.count, 0);
    const presentDays = summary
      .filter((item) => item._id === 'present' || item._id === 'late')
      .reduce((total, item) => total + item.count, 0);

    const attendancePercentage = totalDays > 0
      ? Math.round((presentDays / totalDays) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          rollNumber: student.rollNumber,
          name: `${student.firstName} ${student.lastName || ''}`.trim(),
          class: student.class,
        },
        summary: {
          totalDays,
          presentDays,
          attendancePercentage,
          breakdown: summary,
        },
        history: attendance,
      },
    });
  } catch (error) {
    console.error('Get student attendance history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance history',
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Teacher
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, checkInTime } = req.body;

    const attendance = await Attendance.findById(id)
      .populate('student', 'class school');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Verify the user has permission to update this attendance
    if (req.user.role !== 'admin') {
      const student = await Student.findById(attendance.student._id);
      if (student.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this attendance',
        });
      }
    }

    // Update attendance
    attendance.status = status || attendance.status;
    attendance.remarks = remarks !== undefined ? remarks : attendance.remarks;
    attendance.markedBy = req.user._id;
    attendance.markedAt = new Date();

    if (checkInTime) {
      attendance.checkInTime = new Date(checkInTime);

      // Calculate late minutes if check-in time is after start time
      const school = await School.findById(attendance.school);
      if (school && school.settings.attendanceStartTime) {
        const [startHour, startMinute] = school.settings.attendanceStartTime.split(':').map(Number);
        const checkIn = attendance.checkInTime;
        const startTime = new Date(checkIn);
        startTime.setHours(startHour, startMinute, 0, 0);

        if (checkIn > startTime) {
          const lateMs = checkIn - startTime;
          attendance.lateMinutes = Math.round(lateMs / (1000 * 60));
          if (attendance.lateMinutes > school.settings.lateThreshold) {
            attendance.status = 'late';
          }
        }
      }
    }

    await attendance.save();

    // Update student stats
    await updateStudentAttendanceStats(attendance.student._id);

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating attendance',
    });
  }
};

// @desc    Process face recognition and mark attendance
// @route   POST /api/attendance/recognize
// @access  Private/Teacher
const recognizeAndMarkAttendance = async (req, res) => {
  try {
    const { classId, imageData, mode = 'online' } = req.body;
    const schoolId = req.user.school;

    // Verify class
    const studentClass = await Class.findOne({
      _id: classId,
      school: schoolId,
    });

    if (!studentClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    let recognitionResults = [];

    if (mode === 'online' && process.env.AI_SERVICE_URL) {
      // Online mode - send to AI service
      try {
        const response = await axios.post(
          `${process.env.AI_SERVICE_URL}/recognize`,
          {
            image: imageData,
            schoolId,
            classId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        if (response.data.success) {
          recognitionResults = response.data.recognitions || [];
        }
      } catch (error) {
        console.error('AI service error:', error.message);
        // Fallback to offline mode
        return await processOfflineRecognition(req, res);
      }
    } else {
      // Offline mode
      return await processOfflineRecognition(req, res);
    }

    // Process recognition results
    const attendanceData = [];
    const presentStudents = new Set();

    for (const result of recognitionResults) {
      if (result.confidenceScore > 0.7 && result.studentId) {
        attendanceData.push({
          studentId: result.studentId,
          status: 'present',
          confidenceScore: result.confidenceScore,
        });
        presentStudents.add(result.studentId.toString());
      }
    }

    // Get all students in class
    const students = await Student.find({
      class: classId,
      isActive: true,
    });

    // Mark absent for students not recognized
    for (const student of students) {
      if (!presentStudents.has(student._id.toString())) {
        attendanceData.push({
          studentId: student._id,
          status: 'absent',
          confidenceScore: 0,
        });
      }
    }

    // Mark attendance
    await markAttendanceHelper({
      classId,
      date: new Date(),
      attendanceData,
      recognitionResults,
      mode,
      markedBy: req.user._id,
      schoolId,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked via face recognition',
      data: {
        recognized: recognitionResults.filter(r => r.confidenceScore > 0.7).length,
        total: students.length,
        recognitions: recognitionResults,
      },
    });
  } catch (error) {
    console.error('Recognize and mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing face recognition',
    });
  }
};

// Helper function for offline recognition
const processOfflineRecognition = async (req, res) => {
  // This would integrate with local face recognition
  // For now, return mock data
  return res.status(200).json({
    success: true,
    message: 'Offline recognition mode',
    data: {
      recognized: 0,
      total: 0,
      recognitions: [],
      mode: 'offline',
    },
  });
};

// Helper function to mark attendance
const markAttendanceHelper = async (data) => {
  const { classId, date, attendanceData, recognitionResults, mode, markedBy, schoolId } = data;

  for (const item of attendanceData) {
    const attendance = new Attendance({
      student: item.studentId,
      class: classId,
      school: schoolId,
      date: new Date(date),
      status: item.status,
      markedBy,
      recognitionMethod: mode === 'offline' ? 'offline_auto' : 'auto',
      confidenceScore: item.confidenceScore,
      syncStatus: mode === 'offline' ? 'pending' : 'synced',
    });

    if (mode === 'offline') {
      attendance.offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    await attendance.save();
  }

  // Update face registration status for recognized students
  if (recognitionResults && Array.isArray(recognitionResults)) {
    for (const result of recognitionResults) {
      if (result.confidenceScore > 0.7 && result.studentId) {
        await Student.findByIdAndUpdate(result.studentId, {
          faceRegistered: true,
          lastFaceUpdate: new Date(),
        });
      }
    }
  }
};

// @desc    Get attendance summary for date range
// @route   GET /api/attendance/summary
// @access  Private
const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate, classId } = req.query;
    const schoolId = req.user.school;

    const query = {
      school: schoolId,
    };

    if (classId) {
      query.class = classId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const summary = await Attendance.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          attendance: {
            $push: {
              status: '$_id.status',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 30,
      },
    ]);

    // Get class information if classId provided
    let classInfo = null;
    if (classId) {
      classInfo = await Class.findById(classId).select('name grade section');
    }

    res.status(200).json({
      success: true,
      data: {
        summary,
        class: classInfo,
        dateRange: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance summary',
    });
  }
};

// @desc    Sync offline attendance
// @route   POST /api/attendance/sync
// @access  Private
const syncOfflineAttendance = async (req, res) => {
  try {
    // In a real implementation, this would sync offline attendance records
    // For now, we'll return a mock response
    res.status(200).json({
      success: true,
      message: 'Offline attendance synced successfully',
      data: {
        synced: 0,
        failed: 0,
      },
    });
  } catch (error) {
    console.error('Sync offline attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error syncing offline attendance',
    });
  }
};

module.exports = {
  markAttendance,
  getClassAttendance,
  getStudentAttendanceHistory,
  updateAttendance,
  recognizeAndMarkAttendance,
  getAttendanceSummary,
  markAttendanceHelper,
  syncOfflineAttendance,
};