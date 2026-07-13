const mongoose = require('mongoose');

const sitePageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, trim: true, maxlength: 20000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SitePage', sitePageSchema);
