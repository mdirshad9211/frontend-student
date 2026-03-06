/* eslint-disable no-console */
/**
 * One-time script to sanitize existing exam documents in the database.
 * Run: node scripts/cleanExamData.js (with MONGO_URI set)
 * Optionally: DROP_EXAMS=1 to delete all exams and exam cycles first (fresh start).
 */
const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { sanitizeExamText } = require('../utils/sanitizeExamText');

async function main() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI not set');
  }
  await connectDB(env.MONGO_URI);

  const dropFirst = process.env.DROP_EXAMS === '1' || process.env.DROP_EXAMS === 'true';

  if (dropFirst) {
    const deletedCycles = await ExamCycle.deleteMany({});
    const deletedExams = await Exam.deleteMany({});
    console.log(`Dropped ${deletedExams.deletedCount} exams and ${deletedCycles.deletedCount} cycles.`);
    console.log('Run the SarkariResult scraper again to re-import clean data.');
    process.exit(0);
    return;
  }

  const exams = await Exam.find().lean();
  let updated = 0;
  for (const exam of exams) {
    const name = sanitizeExamText(exam.name, 200) || exam.name;
    const conductingBody = sanitizeExamText(exam.conductingBody, 220) || exam.conductingBody;
    const educationRequired = sanitizeExamText(exam.educationRequired, 120) || exam.educationRequired;
    if (
      name !== exam.name ||
      conductingBody !== exam.conductingBody ||
      educationRequired !== exam.educationRequired
    ) {
      await Exam.updateOne(
        { _id: exam._id },
        { $set: { name, conductingBody, educationRequired } }
      );
      updated += 1;
      console.log('Updated:', exam.name?.slice(0, 50) || exam._id);
    }
  }
  console.log(`Done. Updated ${updated} of ${exams.length} exams.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
