const { asyncHandler } = require('../utils/asyncHandler');
const { listExams, getExamById } = require('../services/exams.service');
const { getUserById } = require('../services/user.service');
const { eligibilityForExam, listEligibleExamsForUser } = require('../services/eligibility.service');

const getExams = asyncHandler(async (req, res) => {
  const exams = await listExams({ state: req.query.state || null });
  res.json({ exams });
});

const getExam = asyncHandler(async (req, res) => {
  const exam = await getExamById(req.params.id);
  res.json({ exam });
});

const getEligibleExams = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.userId);
  const result = await listEligibleExamsForUser(user);
  res.json(result);
});

const getExamEligibility = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.userId);
  const exam = await getExamById(req.params.id);
  res.json({ examId: req.params.id, eligibility: eligibilityForExam(user, exam) });
});

module.exports = { getExams, getExam, getEligibleExams, getExamEligibility };

