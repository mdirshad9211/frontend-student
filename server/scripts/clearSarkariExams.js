/* eslint-disable no-console */
const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');

async function main() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI not set');
  }

  await connectDB(env.MONGO_URI);

  const sarkariExams = await Exam.find({ source: 'sarkariresult' }).select('_id name').lean();
  if (!sarkariExams.length) {
    console.log('No exams with source=sarkariresult found. Nothing to delete.');
    process.exit(0);
    return;
  }

  const ids = sarkariExams.map((e) => e._id);
  const cycleResult = await ExamCycle.deleteMany({ examId: { $in: ids } });
  const examResult = await Exam.deleteMany({ _id: { $in: ids } });

  console.log(`Deleted ${examResult.deletedCount} exams and ${cycleResult.deletedCount} related cycles imported from SarkariResult.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

