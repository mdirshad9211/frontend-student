const cron = require('node-cron');
const UserExam = require('../models/UserExam');
const User = require('../models/User');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const Notification = require('../models/Notification');
const { daysUntil } = require('../utils/date');
const { sendEmail } = require('../utils/email');

async function runDeadlineReminderOnce() {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const cycles = await ExamCycle.find({
    applicationEnd: { $gte: now, $lte: twoDaysFromNow },
  }).lean();

  if (!cycles.length) return;

  const examIds = [...new Set(cycles.map((c) => String(c.examId)))];
  const exams = await Exam.find({ _id: { $in: examIds } }).lean();
  const examMap = new Map(exams.map((e) => [String(e._id), e]));

  const userExams = await UserExam.find({
    examId: { $in: examIds },
    status: { $in: ['interested', 'applied', 'preparing'] },
  }).lean();

  const userIds = [...new Set(userExams.map((ue) => String(ue.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const pairs = [];
  for (const ue of userExams) {
    const user = userMap.get(String(ue.userId));
    if (!user || !user.email) continue;
    const relevantCycles = cycles.filter((c) => String(c.examId) === String(ue.examId));
    for (const cycle of relevantCycles) {
      pairs.push({ user, cycle });
    }
  }

  for (const { user, cycle } of pairs) {
    const exam = examMap.get(String(cycle.examId));
    const d = daysUntil(cycle.applicationEnd);
    const subject = `Reminder: ${exam ? exam.name : 'Exam'} application closes soon`;
    const text = `Hi ${user.name || 'there'},\n\nReminder: The application deadline for ${
      exam ? exam.name : 'your tracked exam'
    } closes in ${d} day(s).\n\nApply here: ${cycle.applyLink}\n\n- Government Exam Tracker`;

    await sendEmail({ to: user.email, subject, text });
    await Notification.create({
      userId: user._id,
      type: 'deadline_reminder',
      message: `Application closes in ${d} day(s) for ${exam ? exam.name : 'an exam'}.`,
      sentAt: new Date(),
    });
  }
}

function scheduleDeadlineReminder() {
  // Daily at 09:00 server time
  cron.schedule('0 9 * * *', async () => {
    try {
      await runDeadlineReminderOnce();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('deadlineReminder failed', e);
    }
  });
}

module.exports = { scheduleDeadlineReminder, runDeadlineReminderOnce };

