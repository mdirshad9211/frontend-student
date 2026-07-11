const { asyncHandler } = require('../utils/asyncHandler');
const { getUserById, updateUserProfile } = require('../services/user.service');

const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.userId);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    category: user.category,
    education: user.education,
    educationHistory: user.educationHistory || [],
    state: user.state,
    role: user.role,
    phone: user.phone,
    gender: user.gender,
    pwd: user.pwd,
    yearOfGraduation: user.yearOfGraduation,
    specialization: user.specialization,
    preferredCategories: user.preferredCategories || [],
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user.userId, req.body);
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    category: user.category,
    education: user.education,
    educationHistory: user.educationHistory || [],
    state: user.state,
    role: user.role,
    phone: user.phone,
    gender: user.gender,
    pwd: user.pwd,
    yearOfGraduation: user.yearOfGraduation,
    specialization: user.specialization,
    preferredCategories: user.preferredCategories || [],
  });
});

module.exports = { getProfile, updateProfile };

