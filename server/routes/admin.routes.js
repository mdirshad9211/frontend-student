const express = require('express');
const { authRequired, adminOnly } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const { examSchema, examCycleSchema } = require('../validators/admin.validators');
const {
  adminCreateExam,
  adminUpdateExam,
  adminDeleteExam,
  adminCreateExamCycle,
  adminListExams,
  adminListExamCycles,
  adminListUsers,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authRequired, adminOnly);

router.get('/exams', adminListExams);
router.post('/exam', validateBody(examSchema), adminCreateExam);
router.put('/exam/:id', validateBody(examSchema.partial()), adminUpdateExam);
router.delete('/exam/:id', adminDeleteExam);

router.get('/exam-cycles', adminListExamCycles);
router.post('/exam-cycle', validateBody(examCycleSchema), adminCreateExamCycle);

router.get('/users', adminListUsers);

module.exports = router;

