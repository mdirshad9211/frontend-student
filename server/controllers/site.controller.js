const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const SitePage = require('../models/SitePage');
const JobPost = require('../models/JobPost');

const defaults = {
  about: { title: 'About Sarkora', content: 'Sarkora helps candidates discover government examination updates, admit cards, results, and important application deadlines.\n\nWe aim to make public exam information easier to find and understand. Always verify important dates, eligibility, fees, and instructions on the official notification before applying.' },
  contact: { title: 'Contact Us', content: 'For general feedback, corrections, or support, contact the Sarkora team through our official social channels.\n\nPlease do not share passwords, OTPs, or personal financial information with anyone.' },
  privacy: { title: 'Privacy Policy', content: 'Sarkora collects only the information needed to provide accounts, saved exams, reminders, and site improvements.\n\nWe do not sell personal information. Analytics may collect usage information to help us improve the service. You can contact us to request account-related help.' },
  disclaimer: { title: 'Disclaimer', content: 'Sarkora is an independent information platform and is not affiliated with any government department, recruiting body, or examination authority.\n\nInformation is provided for general guidance. Candidates must verify all details on the official website and notification before taking action.' },
  terms: { title: 'Terms of Use', content: 'Use Sarkora responsibly and only for lawful purposes. Do not misuse the service, attempt unauthorized access, or rely solely on this website for official decisions.\n\nOfficial recruitment notices, application portals, and authority websites take priority over any information displayed on Sarkora.' },
};

const getPage = asyncHandler(async (req, res) => {
  const fallback = defaults[req.params.slug];
  if (!fallback) throw new ApiError(404, 'Page not found');
  const page = await SitePage.findOne({ slug: req.params.slug }).lean();
  res.json({ page: page || { slug: req.params.slug, ...fallback } });
});
const listJobs = asyncHandler(async (_req, res) => {
  res.json({ jobs: await JobPost.find({ isPublished: true }).sort({ createdAt: -1 }).lean() });
});
const getJob = asyncHandler(async (req, res) => {
  const job = await JobPost.findOne({ _id: req.params.id, isPublished: true }).lean();
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ job });
});
module.exports = { defaults, getPage, listJobs, getJob };
