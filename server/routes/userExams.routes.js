const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const { createUserExamSchema } = require('../validators/userExam.validators');
const { createOrUpdateUserExam, getUserExams } = require('../controllers/userExams.controller');

const router = express.Router();

router.post('/', authRequired, validateBody(createUserExamSchema), createOrUpdateUserExam);
router.get('/', authRequired, getUserExams);

module.exports = router;

