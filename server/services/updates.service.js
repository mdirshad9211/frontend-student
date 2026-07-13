const { ApiError } = require('../utils/ApiError');
const Result = require('../models/Result');
const AdmitCard = require('../models/AdmitCard');

function modelFor(type) {
  return type === 'result' ? Result : AdmitCard;
}

async function listUpdates(type) {
  return modelFor(type).find().populate('examId').sort({ publishedAt: -1 }).lean();
}

async function getUpdate(type, id) {
  const update = await modelFor(type).findById(id).populate('examId').lean();
  if (!update) throw new ApiError(404, type === 'result' ? 'Result not found' : 'Admit card not found');
  return update;
}

module.exports = { listUpdates, getUpdate };
