const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: '' },
    durationSec: { type: Number, default: 0 },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    price: { type: Number, default: 0 },

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    lessons: { type: [lessonSchema], default: [] },

    status: { type: String, enum: ['draft', 'published'], default: 'published' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
