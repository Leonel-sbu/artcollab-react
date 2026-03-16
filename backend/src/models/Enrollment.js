const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  lessonIndex: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  submissionUrl: { type: String, default: '' }, // Student's submitted work URL
  submissionText: { type: String, default: '' },
  submittedAt: { type: Date },

  // Instructor feedback
  grade: { type: Number, default: null }, // 0-100
  feedback: { type: String, default: '' },
  gradedAt: { type: Date },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Status
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded', 'revision'],
    default: 'pending'
  }
}, { _id: true });

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    // Progress tracking
    completedLessons: { type: [Number], default: [] }, // store lesson indexes
    progressPercent: { type: Number, default: 0 },

    // Level/Productivity tracking
    currentLevel: { type: Number, default: 1 }, // 1-10
    totalPoints: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }, // Days in a row learning
    lastActivityDate: { type: Date },

    // Student work/assignments
    assignments: { type: [assignmentSchema], default: [] },

    // Course completion
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    certificateUrl: { type: String, default: '' },

    // Enrollment type
    enrollmentType: {
      type: String,
      enum: ['one-time', 'monthly', 'yearly'],
      default: 'one-time'
    },
    expiresAt: { type: Date } // For subscription expiry
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Calculate level based on points
enrollmentSchema.methods.calculateLevel = function () {
  // Level up every 100 points
  return Math.min(10, Math.floor(this.totalPoints / 100) + 1);
};

// Add points and update level
enrollmentSchema.methods.addPoints = function (points) {
  this.totalPoints += points;
  this.currentLevel = this.calculateLevel();
  this.lastActivityDate = new Date();

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (this.lastActivityDate && this.lastActivityDate > yesterday) {
    this.streakDays += 1;
  } else {
    this.streakDays = 1;
  }

  return this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
