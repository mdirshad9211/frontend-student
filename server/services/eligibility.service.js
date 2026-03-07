const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { calculateAge } = require('../utils/date');
const { isEducationEligible, isEducationEligibleForKeys } = require('../utils/education');

function eligibilityForExam(user, exam) {
  const age = calculateAge(user.dob);
  const ageOk = age !== null && age >= exam.minAge && age <= exam.maxAge;
  const hasKeys = Array.isArray(exam.educationKeys) && exam.educationKeys.length > 0;
  const educationOk =
    Boolean(user.education) &&
    (hasKeys
      ? isEducationEligibleForKeys(user.education, exam.educationKeys)
      : isEducationEligible(user.education, exam.educationRequired));
  const eligible = Boolean(user.dob && user.education) ? ageOk && educationOk : false;

  return {
    eligible,
    reasons: {
      missingProfile: !(user.dob && user.education),
      ageOk,
      educationOk,
      userAge: age,
    },
  };
}

async function listEligibleExamsForUser(user) {
  const exams = await Exam.find().sort({ createdAt: -1 }).lean();
  const examIds = exams.map((e) => e._id);

  const cycles = await ExamCycle.aggregate([
    { $match: { examId: { $in: examIds } } },
    { $sort: { applicationStart: -1 } },
    { $group: { _id: '$examId', latestCycle: { $first: '$$ROOT' } } },
  ]);
  const cycleMap = new Map(cycles.map((c) => [String(c._id), c.latestCycle]));

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activeForms = [];
  const eligibleExams = [];

  for (const exam of exams) {
    const evalResult = eligibilityForExam(user, exam);
    const latestCycle = cycleMap.get(String(exam._id)) || null;

    const withMeta = {
      ...exam,
      latestCycle,
      eligibility: evalResult,
    };

    const applicationEndDate = latestCycle ? new Date(latestCycle.applicationEnd) : null;
    const isExpired = applicationEndDate && applicationEndDate < startOfToday;

    if (evalResult.eligible && !isExpired) eligibleExams.push(withMeta);

    if (
      latestCycle &&
      new Date(latestCycle.applicationStart) <= now &&
      new Date(latestCycle.applicationEnd) >= now
    ) {
      activeForms.push(withMeta);
    }
  }

  return { eligibleExams, activeForms };
}

module.exports = { eligibilityForExam, listEligibleExamsForUser };

