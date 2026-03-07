const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    dob: { type: Date },
    category: { type: String, trim: true },
    education: { type: String, trim: true },
    state: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Extra profile fields for better eligibility matching
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], trim: true },
    pwd: { type: Boolean, default: false },
    yearOfGraduation: { type: Number, min: 1990, max: 2030 },
    specialization: { type: String, trim: true },
    preferredCategories: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

