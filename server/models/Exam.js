const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    conductingBody: { type: String, required: true, trim: true },
    minAge: { type: Number, required: true, min: 0 },
    maxAge: { type: Number, required: true, min: 0 },
    educationRequired: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    officialWebsite: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);

