/* eslint-disable no-console */
const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const AdmitCard = require('../models/AdmitCard');

async function main() {
  await connectDB(env.MONGO_URI, env.DNS_SERVERS);
  const exams = await Exam.find({
    $or: [
      { latestResultLink: { $ne: null } },
      { latestResultDeclaredAt: { $ne: null } },
      { latestAdmitCardLink: { $ne: null } },
      { latestAdmitCardReleasedAt: { $ne: null } },
    ],
  }).lean();

  let results = 0;
  let admitCards = 0;
  for (const exam of exams) {
    if (exam.latestResultLink || exam.latestResultDeclaredAt) {
      await Result.updateOne(
        { sourceUrl: exam.latestResultLink || 'legacy-result:' + exam._id },
        { $set: { details: exam.details || '' }, $setOnInsert: { examId: exam._id, title: exam.name + ' Result', officialLink: exam.latestResultLink || null, publishedAt: exam.latestResultDeclaredAt || exam.updatedAt || new Date() } },
        { upsert: true }
      );
      results += 1;
    }
    if (exam.latestAdmitCardLink || exam.latestAdmitCardReleasedAt) {
      await AdmitCard.updateOne(
        { sourceUrl: exam.latestAdmitCardLink || 'legacy-admit-card:' + exam._id },
        { $set: { details: exam.details || '' }, $setOnInsert: { examId: exam._id, title: exam.name + ' Admit Card', officialLink: exam.latestAdmitCardLink || null, publishedAt: exam.latestAdmitCardReleasedAt || exam.updatedAt || new Date() } },
        { upsert: true }
      );
      admitCards += 1;
    }
  }
  console.log('Migration complete:', { results, admitCards });
  process.exit(0);
}

main().catch((error) => { console.error(error); process.exit(1); });


