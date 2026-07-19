const Exam = require('../models/Exam');
const Result = require('../models/Result');
const AdmitCard = require('../models/AdmitCard');
const JobPost = require('../models/JobPost');
const { env } = require('../config/env');

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));
}

function toLastmod(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function sitemapUrl(loc, lastmod, changefreq, priority) {
  return `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

const getSitemap = async (req, res, next) => {
  try {
    const siteUrl = (env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const [exams, results, admitCards, jobs] = await Promise.all([
      Exam.find().select('_id updatedAt').sort({ updatedAt: -1 }).limit(45000).lean(),
      Result.find().select('_id updatedAt publishedAt').sort({ publishedAt: -1 }).limit(45000).lean(),
      AdmitCard.find().select('_id updatedAt publishedAt').sort({ publishedAt: -1 }).limit(45000).lean(),
      JobPost.find({ isPublished: true }).select('_id updatedAt createdAt').sort({ updatedAt: -1 }).limit(45000).lean(),
    ]);

    const urls = [
      sitemapUrl(`${siteUrl}/`, null, 'daily', '1.0'),
      sitemapUrl(`${siteUrl}/exams`, null, 'daily', '0.9'),
      sitemapUrl(`${siteUrl}/results`, null, 'daily', '0.9'),
      sitemapUrl(`${siteUrl}/admit-cards`, null, 'daily', '0.9'),
      sitemapUrl(`${siteUrl}/careers`, null, 'weekly', '0.6'),
      ...['about', 'contact', 'privacy', 'disclaimer', 'terms'].map((slug) => sitemapUrl(`${siteUrl}/${slug}`, null, 'monthly', '0.4')),
      ...exams.map((item) => sitemapUrl(`${siteUrl}/exams/${item._id}`, toLastmod(item.updatedAt), 'weekly', '0.8')),
      ...results.map((item) => sitemapUrl(`${siteUrl}/results/${item._id}`, toLastmod(item.updatedAt || item.publishedAt), 'monthly', '0.8')),
      ...admitCards.map((item) => sitemapUrl(`${siteUrl}/admit-cards/${item._id}`, toLastmod(item.updatedAt || item.publishedAt), 'monthly', '0.8')),
      ...jobs.map((item) => sitemapUrl(`${siteUrl}/careers/${item._id}`, toLastmod(item.updatedAt || item.createdAt), 'weekly', '0.7')),
    ];

    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSitemap };