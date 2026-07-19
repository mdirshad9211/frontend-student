const express = require('express');
const { authRequired, adminOnly } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const { examSchema, examCycleSchema, pageSchema, jobSchema, scraperSchema } = require('../validators/admin.validators');
const { adminActionRateLimiter, scraperRateLimiter } = require('../middlewares/rateLimiter');
const {
  adminCreateExam,
  adminUpdateExam,
  adminDeleteExam,
  adminCreateExamCycle,
  adminListExams,
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
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authRequired, adminOnly, adminActionRateLimiter);

router.get('/exams', adminListExams);
router.post('/exam', validateBody(examSchema), adminCreateExam);
router.put('/exam/:id', validateBody(examSchema.partial()), adminUpdateExam);
router.delete('/exam/:id', adminDeleteExam);

router.get('/exam-cycles', adminListExamCycles);
router.post('/exam-cycle', validateBody(examCycleSchema), adminCreateExamCycle);

router.get('/users', adminListUsers);
router.get('/pages', adminListPages);
router.put('/pages/:slug', validateBody(pageSchema), adminSavePage);
router.get('/jobs', adminListJobs);
router.post('/jobs', validateBody(jobSchema), adminCreateJob);
router.put('/jobs/:id', validateBody(jobSchema.partial()), adminUpdateJob);
router.delete('/jobs/:id', adminDeleteJob);
router.get('/results', adminListResults);
router.get('/admit-cards', adminListAdmitCards);

// Trigger SarkariResult scraper from admin panel
router.post('/scrape/sarkariresult', scraperRateLimiter, validateBody(scraperSchema), adminRunSarkariScraper);

module.exports = router;





