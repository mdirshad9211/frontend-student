const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { ApiError } = require('../utils/ApiError');

async function listExams() {
  const exams = await Exam.find().sort({ createdAt: -1 });
  const examIds = exams.map((e) => e._id);
  const cycles = await ExamCycle.aggregate([
    { $match: { examId: { $in: examIds } } },
    { $sort: { applicationStart: -1 } },
    {
      $group: {
        _id: '$examId',
        latestCycle: { $first: '$$ROOT' },
      },
    },
  ]);
  const map = new Map(cycles.map((c) => [String(c._id), c.latestCycle]));

  return exams.map((e) => ({
    ...e.toObject(),
    latestCycle: map.get(String(e._id)) || null,
  }));
}

async function getExamById(examId) {
  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  const cycles = await ExamCycle.find({ examId }).sort({ applicationStart: -1 });
  return { ...exam.toObject(), cycles };
}

async function createExam(payload) {
  return Exam.create(payload);
}

async function updateExam(examId, payload) {
  const exam = await Exam.findByIdAndUpdate(examId, payload, { new: true });
  if (!exam) throw new ApiError(404, 'Exam not found');
  return exam;
}

async function deleteExam(examId) {
  const exam = await Exam.findByIdAndDelete(examId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  await ExamCycle.deleteMany({ examId });
  return exam;
}

async function createExamCycle(payload) {
  const exam = await Exam.findById(payload.examId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  const cycle = await ExamCycle.create({
    ...payload,
    applicationStart: new Date(payload.applicationStart),
    applicationEnd: new Date(payload.applicationEnd),
    examDate: new Date(payload.examDate),
  });
  return cycle;
}

async function listExamCycles() {
  return ExamCycle.find().populate('examId').sort({ applicationEnd: 1 });
}

module.exports = {
  listExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  createExamCycle,
  listExamCycles,
};

