const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'leave'],
    default: 'absent',
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  recognitionMethod: {
    type: String,
    enum: ['auto', 'manual', 'offline_auto'],
    default: 'manual',
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  },
  remarks: {
    type: String,
    trim: true,
  },
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'synced',
  },
  offlineId: {
    type: String,
    unique: true,
    sparse: true,
  },
  midDayMealServed: {
    type: Boolean,
    default: false,
  },
  lateMinutes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for unique attendance per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

// Index for efficient querying
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ school: 1, date: 1 });
attendanceSchema.index({ syncStatus: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);