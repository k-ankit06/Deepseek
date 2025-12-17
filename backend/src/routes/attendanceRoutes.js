const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const attendanceController = require('../controllers/attendanceController');
const { validate } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Attendance validation
const markAttendanceValidation = [
  body('classId').notEmpty().withMessage('Class ID is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('attendanceData').isArray().withMessage('Attendance data must be an array'),
  body('attendanceData.*.studentId').notEmpty().withMessage('Student ID is required'),
  body('attendanceData.*.status').isIn(['present', 'absent', 'late', 'leave']).withMessage('Invalid status'),
];

const recognizeAttendanceValidation = [
  body('classId').notEmpty().withMessage('Class ID is required'),
  body('imageData').notEmpty().withMessage('Image data is required'),
  body('mode').optional().isIn(['online', 'offline']).withMessage('Mode must be online or offline'),
];

const captureAttendanceValidation = [
  body('classId').notEmpty().withMessage('Class ID is required'),
  body('imageData').notEmpty().withMessage('Image data is required'),
  body('mode').optional().isIn(['online', 'offline']).withMessage('Mode must be online or offline'),
];

const updateAttendanceValidation = [
  body('status').optional().isIn(['present', 'absent', 'late', 'leave']).withMessage('Invalid status'),
  body('checkInTime').optional().isISO8601().withMessage('Valid check-in time is required'),
];

const dailyAttendanceValidation = [
  query('date').optional().isISO8601().withMessage('Valid date is required'),
  query('classId').notEmpty().withMessage('Class ID is required'),
];

const monthlyAttendanceValidation = [
  query('month').notEmpty().withMessage('Month is required'),
  query('year').notEmpty().withMessage('Year is required'),
  query('classId').notEmpty().withMessage('Class ID is required'),
];

// Attendance routes
router.post('/mark', authorize('teacher', 'admin'), validate(markAttendanceValidation), attendanceController.markAttendance);
router.post('/recognize', authorize('teacher', 'admin'), validate(recognizeAttendanceValidation), attendanceController.recognizeAndMarkAttendance);
router.post('/capture', authorize('teacher', 'admin'), validate(captureAttendanceValidation), attendanceController.recognizeAndMarkAttendance);
router.get('/class/:classId/date/:date', attendanceController.getClassAttendance);
router.get('/daily', validate(dailyAttendanceValidation), attendanceController.getClassAttendance);
router.get('/monthly', validate(monthlyAttendanceValidation), attendanceController.getAttendanceSummary);
router.get('/student/:studentId', attendanceController.getStudentAttendanceHistory);
router.put('/:id', authorize('teacher', 'admin'), validate(updateAttendanceValidation), attendanceController.updateAttendance);
router.post('/sync', attendanceController.syncOfflineAttendance);

module.exports = router;