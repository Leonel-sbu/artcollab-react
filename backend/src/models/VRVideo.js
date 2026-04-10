const mongoose = require('mongoose');

const vrVideoSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 1000 },
    videoUrl:    { type: String, required: true },    // YouTube / Vimeo / direct link
    thumbnail:   { type: String, default: '' },
    addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VRVideo', vrVideoSchema);
