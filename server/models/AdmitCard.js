const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    title: { type: String, required: true, trim: true },
    officialLink: { type: String, trim: true, default: null },
    details: { type: String, trim: true, default: '' },
    sourceUrl: { type: String, required: true, trim: true, unique: true },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdmitCard', admitCardSchema);

