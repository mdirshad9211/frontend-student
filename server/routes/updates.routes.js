const express = require('express');
const { listResults, getResult, listAdmitCards, getAdmitCard } = require('../controllers/updates.controller');

const router = express.Router();
router.get('/results', listResults);
router.get('/results/:id', getResult);
router.get('/admit-cards', listAdmitCards);
router.get('/admit-cards/:id', getAdmitCard);

module.exports = router;
