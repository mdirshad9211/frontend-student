const express = require('express');
const { getPage, listJobs, getJob } = require('../controllers/site.controller');
const router = express.Router();
router.get('/pages/:slug', getPage);
router.get('/careers', listJobs);
router.get('/careers/:id', getJob);
module.exports = router;
