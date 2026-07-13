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
const { listUpdates } = require('../services/updates.service');
const SitePage = require('../models/SitePage');
const JobPost = require('../models/JobPost');
const { defaults } = require('./site.controller');
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

const adminListResults = asyncHandler(async (_req, res) => res.json({ results: await listUpdates('result') }));
const adminListAdmitCards = asyncHandler(async (_req, res) => res.json({ admitCards: await listUpdates('admit_card') }));

const adminListPages = asyncHandler(async (_req, res) => {
  const saved = await SitePage.find().lean();
  const map = new Map(saved.map((page) => [page.slug, page]));
  const pages = Object.entries(defaults).map(([slug, fallback]) => map.get(slug) || { slug, ...fallback });
  res.json({ pages });
});
const adminSavePage = asyncHandler(async (req, res) => {
  const fallback = defaults[req.params.slug];
  if (!fallback) throw new Error('Unknown page');
  const title = String(req.body.title || fallback.title).trim();
  const content = String(req.body.content || fallback.content).trim();
  const page = await SitePage.findOneAndUpdate({ slug: req.params.slug }, { slug: req.params.slug, title, content }, { new: true, upsert: true, runValidators: true });
  res.json({ page });
});
const adminListJobs = asyncHandler(async (_req, res) => res.json({ jobs: await JobPost.find().sort({ createdAt: -1 }).lean() }));
const adminCreateJob = asyncHandler(async (req, res) => res.status(201).json({ job: await JobPost.create(req.body) }));
const adminUpdateJob = asyncHandler(async (req, res) => res.json({ job: await JobPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) }));
const adminDeleteJob = asyncHandler(async (req, res) => { await JobPost.findByIdAndDelete(req.params.id); res.json({ success: true }); });
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
  adminListResults,
  adminListAdmitCards,
  adminRunSarkariScraper,
  adminListPages,
  adminSavePage,
  adminListJobs,
  adminCreateJob,
  adminUpdateJob,
  adminDeleteJob,
};





