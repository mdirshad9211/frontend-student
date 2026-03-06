const { asyncHandler } = require('../utils/asyncHandler');
const {
  createExam,
  updateExam,
  deleteExam,
  createExamCycle,
  listExams,
  listExamCycles,
} = require('../services/exams.service');
const { listUsers } = require('../services/user.service');
const { runSarkariScraper } = require('../services/sarkariScraper.service');

const adminListExams = asyncHandler(async (req, res) => {
  const exams = await listExams();
  res.json({ exams });
});

const adminCreateExam = asyncHandler(async (req, res) => {
  const exam = await createExam(req.body);
  res.status(201).json({ exam });
});

const adminUpdateExam = asyncHandler(async (req, res) => {
  const exam = await updateExam(req.params.id, req.body);
  res.json({ exam });
});

const adminDeleteExam = asyncHandler(async (req, res) => {
  await deleteExam(req.params.id);
  res.json({ success: true });
});

const adminCreateExamCycle = asyncHandler(async (req, res) => {
  const cycle = await createExamCycle(req.body);
  res.status(201).json({ examCycle: cycle });
});

const adminListExamCycles = asyncHandler(async (req, res) => {
  const cycles = await listExamCycles();
  res.json({ examCycles: cycles });
});

const adminListUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();
  res.json({
    users: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      dob: u.dob,
      category: u.category,
      education: u.education,
      state: u.state,
      createdAt: u.createdAt,
    })),
  });
});

const adminRunSarkariScraper = asyncHandler(async (req, res) => {
  const limit = Number(req.body?.limit || 40);
  const safeLimit = Number.isNaN(limit) || limit <= 0 ? 40 : Math.min(limit, 150);
  const result = await runSarkariScraper({ limit: safeLimit });
  res.json({ ok: true, limit: safeLimit, ...result });
});

module.exports = {
  adminListExams,
  adminCreateExam,
  adminUpdateExam,
  adminDeleteExam,
  adminCreateExamCycle,
  adminListExamCycles,
  adminListUsers,
  adminRunSarkariScraper,
};

