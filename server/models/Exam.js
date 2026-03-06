const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    conductingBody: { type: String, required: true, trim: true },
    minAge: { type: Number, required: true, min: 0 },
    maxAge: { type: Number, required: true, min: 0 },
    educationRequired: { type: String, required: true, trim: true },
     totalPosts: { type: Number, min: 0 },
    category: { type: String, trim: true },
    officialWebsite: { type: String, required: true, trim: true },
    // Optional metadata to support scraping/imports
    source: { type: String, enum: ['sarkariresult'], default: null, index: true },
    sourceUrl: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);

