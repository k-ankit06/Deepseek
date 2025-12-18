const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number'],
  },
  firstName: {
    type: String,
    required: [true, 'Please add first name'],
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
  },
  parentName: {
    type: String,
  },
  parentPhone: {
    type: String,
  },
  address: {
    type: String,
  },
  aadhaarNumber: {
    type: String,
    sparse: true,
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
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  faceRegistered: {
    type: Boolean,
    default: false,
  },
  lastFaceUpdate: {
    type: Date,
  },
  attendanceStats: {
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
  },
  midDayMealEligible: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

studentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

module.exports = mongoose.model('Student', studentSchema);