const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { ApiError } = require('../utils/ApiError');
const { sanitizeExamText } = require('../utils/sanitizeExamText');
const { inferExamCategory } = require('../utils/inferExamCategory');

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

  return exams.map((e) => {
    const o = e.toObject();
    o.name = sanitizeExamText(o.name, 200) || o.name;
    o.conductingBody = sanitizeExamText(o.conductingBody, 220) || o.conductingBody;
    o.educationRequired = sanitizeExamText(o.educationRequired, 120) || o.educationRequired;
    // Do not send large details blob in list response
    if (o.details) delete o.details;
    // Ensure category is set: use stored or infer from name + URL (regex-based)
    if (!o.category || o.category === 'Other') {
      o.category = inferExamCategory({ name: o.name, url: o.officialWebsite || o.sourceUrl || '' });
    }
    return {
      ...o,
      latestCycle: map.get(String(e._id)) || null,
    };
  });
}

async function getExamById(examId) {
  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  const cycles = await ExamCycle.find({ examId }).sort({ applicationStart: -1 });
  const o = exam.toObject();
  o.name = sanitizeExamText(o.name, 200) || o.name;
  o.conductingBody = sanitizeExamText(o.conductingBody, 220) || o.conductingBody;
  o.educationRequired = sanitizeExamText(o.educationRequired, 120) || o.educationRequired;
  if (!o.category || o.category === 'Other') {
    o.category = inferExamCategory({ name: o.name, url: o.officialWebsite || o.sourceUrl || '' });
  }
  return { ...o, cycles };
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

