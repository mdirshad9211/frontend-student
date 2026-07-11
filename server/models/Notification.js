const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', index: true, default: null },
    type: { type: String, required: true, trim: true },
    updateType: { type: String, enum: ['result', 'admit_card'], default: null },
    link: { type: String, trim: true, default: null },
    dedupKey: { type: String, trim: true, default: null },
    message: { type: String, required: true, trim: true },
    sentAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ dedupKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);

