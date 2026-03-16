const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  durationSec: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false } // Free preview lesson
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },

  // Instructor
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Pricing Options
  pricing: {
    // One-time purchase
    oneTime: {
      enabled: { type: Boolean, default: true },
      price: { type: Number, default: 0 },
      currency: { type: String, default: 'ZAR' }
    },
    // Monthly subscription
    monthly: {
      enabled: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      currency: { type: String, default: 'ZAR' }
    },
    // Yearly subscription
    yearly: {
      enabled: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      currency: { type: String, default: 'ZAR' }
    },
    // Subscription plan (for all-access)
    subscription: {
      enabled: { type: Boolean, default: false },
      monthlyPrice: { type: Number, default: 0 },
      yearlyPrice: { type: Number, default: 0 }
    }
  },

  // Course metadata
  category: {
    type: String,
    enum: ['art', 'design', '3d', 'animation', 'photography', 'music', 'business', 'other'],
    default: 'art'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  tags: { type: [String], default: [] },

  // Content
  lessons: { type: [lessonSchema], default: [] },
  totalDurationSec: { type: Number, default: 0 },

  // Statistics
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  // Instructor earnings tracking
  revenue: {
    oneTimeEarnings: { type: Number, default: 0 },
    subscriptionEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 }
  },

  // Status
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },

  // What you'll learn
  learningOutcomes: { type: [String], default: [] },
  requirements: { type: [String], default: [] }
}, { timestamps: true });

// Text search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Calculate total duration before saving
courseSchema.pre('save', function (next) {
  if (this.lessons && this.lessons.length > 0) {
    this.totalDurationSec = this.lessons.reduce((sum, lesson) => sum + (lesson.durationSec || 0), 0);
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
