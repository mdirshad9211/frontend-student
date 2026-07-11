const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function updateUserProfile(userId, payload) {
  const allowed = [
    'dob', 'category', 'education', 'state',
    'educationHistory', 'phone', 'gender', 'pwd', 'yearOfGraduation', 'specialization', 'preferredCategories',
  ];
  const update = {};
  for (const key of allowed) {
    if (payload[key] === undefined) continue;
    if (key === 'dob') update.dob = payload.dob ? new Date(payload.dob) : null;
    else if (key === 'pwd') update.pwd = Boolean(payload.pwd);
    else if (key === 'yearOfGraduation') update.yearOfGraduation = payload.yearOfGraduation || null;
    else if (key === 'preferredCategories') update.preferredCategories = Array.isArray(payload.preferredCategories) ? payload.preferredCategories.filter(Boolean) : [];
    else if (key === 'educationHistory') {
      update.educationHistory = Array.isArray(payload.educationHistory)
        ? payload.educationHistory
            .filter((x) => x && x.education)
            .map((x) => ({
              education: x.education,
              specialization: x.specialization || null,
              institute: x.institute || null,
              yearOfPassing: x.yearOfPassing || null,
            }))
        : [];
    }
    else update[key] = payload[key] || null;
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function listUsers() {
  return User.find().sort({ createdAt: -1 });
}

module.exports = { getUserById, updateUserProfile, listUsers };

