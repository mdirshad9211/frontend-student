const mongoose = require('mongoose');

const educationEntrySchema = new mongoose.Schema(
  {
    education: { type: String, trim: true, required: true },
    specialization: { type: String, trim: true, default: null },
    institute: { type: String, trim: true, default: null },
    yearOfPassing: { type: Number, min: 1990, max: 2035, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    dob: { type: Date },
    category: { type: String, trim: true },
    education: { type: String, trim: true },
    educationHistory: { type: [educationEntrySchema], default: [] },
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

