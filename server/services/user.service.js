const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function updateUserProfile(userId, { dob, category, education, state }) {
  const update = {};
  if (dob !== undefined) update.dob = dob ? new Date(dob) : null;
  if (category !== undefined) update.category = category || null;
  if (education !== undefined) update.education = education || null;
  if (state !== undefined) update.state = state || null;

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function listUsers() {
  return User.find().sort({ createdAt: -1 });
}

module.exports = { getUserById, updateUserProfile, listUsers };

