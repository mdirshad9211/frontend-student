const { env } = require('../config/env');
const { asyncHandler } = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const { registerUser, loginUser } = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  const token = signToken({ userId: user._id, role: user.role }, env.JWT_SECRET);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.body);
  const token = signToken({ userId: user._id, role: user.role }, env.JWT_SECRET);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = { register, login };

