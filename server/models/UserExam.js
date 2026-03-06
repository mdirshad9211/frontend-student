const mongoose = require('mongoose');

const userExamSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    status: { type: String, enum: ['interested', 'applied', 'preparing'], required: true },
  },
  { timestamps: true }
);

userExamSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('UserExam', userExamSchema);

