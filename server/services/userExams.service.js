const UserExam = require('../models/UserExam');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { ApiError } = require('../utils/ApiError');

async function upsertUserExam({ userId, examId, status }) {
  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError(404, 'Exam not found');

  const doc = await UserExam.findOneAndUpdate(
    { userId, examId },
    { status },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return doc;
}

async function listUserExams(userId) {
  const items = await UserExam.find({ userId }).sort({ updatedAt: -1 }).lean();
  const examIds = items.map((i) => i.examId);
  const exams = await Exam.find({ _id: { $in: examIds } }).lean();
  const examMap = new Map(exams.map((e) => [String(e._id), e]));

  const validExamIds = new Set(exams.map((e) => String(e._id)));
  const orphanIds = items.filter((i) => !validExamIds.has(String(i.examId))).map((i) => i._id);
  if (orphanIds.length > 0) {
    await UserExam.deleteMany({ _id: { $in: orphanIds } });
  }

  const idsForCycles = examIds.filter((id) => validExamIds.has(String(id)));
  const cycles = await ExamCycle.aggregate([
    { $match: { examId: { $in: idsForCycles } } },
    { $sort: { applicationStart: -1 } },
    { $group: { _id: '$examId', latestCycle: { $first: '$$ROOT' } } },
  ]);
  const cycleMap = new Map(cycles.map((c) => [String(c._id), c.latestCycle]));

  return items
    .filter((i) => validExamIds.has(String(i.examId)))
    .map((i) => ({
      ...i,
      exam: examMap.get(String(i.examId)) || null,
      latestCycle: cycleMap.get(String(i.examId)) || null,
    }));
}

module.exports = { upsertUserExam, listUserExams };

