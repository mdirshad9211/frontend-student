const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    location: { type: String, trim: true, default: 'Remote' },
    employmentType: { type: String, trim: true, default: 'Full-time' },
    summary: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    applicationUrl: { type: String, trim: true, default: '' },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobPost', jobPostSchema);
