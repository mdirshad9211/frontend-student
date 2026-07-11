const UserExam = require('../models/UserExam');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function notifyAppliedUsersForExamUpdate({ exam, updateType, link, date }) {
  if (!exam || !exam._id || !link) return { notified: 0 };

  const userExams = await UserExam.find({ examId: exam._id, status: 'applied' }).lean();
  if (!userExams.length) return { notified: 0 };

  const userIds = [...new Set(userExams.map((x) => String(x.userId)))];
  const users = await User.find({ _id: { $in: userIds } }, { _id: 1 }).lean();

  let notified = 0;
  for (const user of users) {
    const dedupKey = `${String(user._id)}:${String(exam._id)}:${updateType}:${link}`;
    const exists = await Notification.findOne({ dedupKey }).lean();
    if (exists) continue;

    const label = updateType === 'result' ? 'Result declared' : 'Admit card released';
    await Notification.create({
      userId: user._id,
      examId: exam._id,
      type: 'exam_update',
      updateType,
      link,
      dedupKey,
      message: `${label} for ${exam.name}`,
      sentAt: date || new Date(),
    });
    notified += 1;
  }

  return { notified };
}

module.exports = { notifyAppliedUsersForExamUpdate };
