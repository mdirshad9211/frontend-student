const express = require('express');
const { getExams, getExam, getEligibleExams } = require('../controllers/exams.controller');
const { authRequired } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getExams);
router.get('/eligible', authRequired, getEligibleExams);
router.get('/:id', getExam);

module.exports = router;

