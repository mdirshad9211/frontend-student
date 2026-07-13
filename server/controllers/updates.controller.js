const { asyncHandler } = require('../utils/asyncHandler');
const { listUpdates, getUpdate } = require('../services/updates.service');

const listResults = asyncHandler(async (_req, res) => res.json({ results: await listUpdates('result') }));
const getResult = asyncHandler(async (req, res) => res.json({ result: await getUpdate('result', req.params.id) }));
const listAdmitCards = asyncHandler(async (_req, res) => res.json({ admitCards: await listUpdates('admit_card') }));
const getAdmitCard = asyncHandler(async (req, res) => res.json({ admitCard: await getUpdate('admit_card', req.params.id) }));

module.exports = { listResults, getResult, listAdmitCards, getAdmitCard };
