const mongoose = require('mongoose');

const examCycleSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    applicationStart: { type: Date, required: true },
    applicationEnd: { type: Date, required: true, index: true },
    examDate: { type: Date, required: true },
    applyLink: { type: String, required: true, trim: true },
    notificationPdf: { type: String, trim: true },
  },
  { timestamps: true }
);

examCycleSchema.index({ examId: 1, applicationStart: -1 });

module.exports = mongoose.model('ExamCycle', examCycleSchema);

