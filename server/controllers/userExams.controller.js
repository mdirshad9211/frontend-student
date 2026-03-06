const { asyncHandler } = require('../utils/asyncHandler');
const { upsertUserExam, listUserExams } = require('../services/userExams.service');

const createOrUpdateUserExam = asyncHandler(async (req, res) => {
  const item = await upsertUserExam({
    userId: req.user.userId,
    examId: req.body.examId,
    status: req.body.status,
  });
  res.status(201).json({ userExam: item });
});

const getUserExams = asyncHandler(async (req, res) => {
  const items = await listUserExams(req.user.userId);
  res.json({ userExams: items });
});

module.exports = { createOrUpdateUserExam, getUserExams };

