/* eslint-disable no-console */
const axios = require('axios');
const cheerio = require('cheerio');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { sanitizeExamText } = require('../utils/sanitizeExamText');
const { inferExamCategory } = require('../utils/inferExamCategory');

const ROOT = 'https://www.sarkariresult.com';
const LATEST_JOB_URL = `${ROOT}/latestjob/`;

function parseIndianDate(value) {
  if (!value) return null;
  const trimmed = String(value).replace(/\s+/g, ' ').trim();
  const m = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00+05:30`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function extractFromText(text, label) {
  const re = new RegExp(`${label}\\s*:?\\s*([^\\n\\r]+)`, 'i');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function extractAge(text) {
  const minMatch = text.match(/Minimum Age\s*:?[^0-9]*(\d+)/i);
  const maxMatch = text.match(/Maximum Age\s*:?[^0-9]*(\d+)/i);
  const minAge = minMatch ? Number(minMatch[1]) : 18;
  const maxAge = maxMatch ? Number(maxMatch[1]) : 40;
  return { minAge, maxAge };
}

function extractTotalPosts(text) {
  if (!text) return null;
  const m = text.match(/Total\s+Post[s]?\s*:?[^0-9]*([\d,]+)/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  if (Number.isNaN(n)) return null;
  return n;
}

function extractEducation(text) {
  if (!text) return null;
  const raw =
    extractFromText(text, 'Education Qualification') ||
    extractFromText(text, 'Educational Qualification') ||
    extractFromText(text, 'Eligibility Details') ||
    extractFromText(text, 'Eligibility');
  if (raw) return sanitizeExamText(raw, 160);

  const idx = text.toLowerCase().indexOf('eligibility');
  if (idx >= 0) {
    return sanitizeExamText(text.slice(idx, idx + 320), 160);
  }
  return null;
}

async function parseJobDetail(url) {
  const res = await axios.get(url, { timeout: 20000 });
  const html = res.data;
  const $ = cheerio.load(html);
  const fullText = $('body').text().replace(/\s+/g, ' ').trim();

  const totalPosts = extractTotalPosts(fullText);

  const datesSectionStart = fullText.toLowerCase().indexOf('important dates');
  const datesChunk =
    datesSectionStart >= 0 ? fullText.slice(datesSectionStart, datesSectionStart + 2000) : fullText;

  const appBeginRaw =
    extractFromText(datesChunk, 'Application Begin') || extractFromText(datesChunk, 'Application Start');
  const lastDateRaw =
    extractFromText(datesChunk, 'Last Date for Apply Online') ||
    extractFromText(datesChunk, 'Last Date For Apply Online') ||
    extractFromText(datesChunk, 'Last Date :');
  const examDateRaw =
    extractFromText(datesChunk, 'Exam Date') ||
    extractFromText(datesChunk, 'Date of Examination') ||
    extractFromText(datesChunk, 'Online Exam Date');

  const applicationStart = parseIndianDate(appBeginRaw);
  const applicationEnd = parseIndianDate(lastDateRaw);
  const examDate = parseIndianDate(examDateRaw);

  const ageSectionStart = fullText.toLowerCase().indexOf('age limit');
  const ageChunk =
    ageSectionStart >= 0 ? fullText.slice(ageSectionStart, ageSectionStart + 1500) : fullText;
  const { minAge, maxAge } = extractAge(ageChunk || fullText);

  const eligibilitySectionStart = fullText.toLowerCase().indexOf('eligibility');
  const eligibilityChunk =
    eligibilitySectionStart >= 0
      ? fullText.slice(eligibilitySectionStart, eligibilitySectionStart + 1200)
      : fullText;
  const educationRequired =
    extractEducation(eligibilityChunk) || extractEducation(fullText) || 'See notification';

  const titleRaw = $('h1').first().text().trim() || $('title').text().trim();
  const title = sanitizeExamText(titleRaw || 'Government Exam', 180);

  const conductingBodyRaw =
    $('h2').first().text().trim() ||
    extractFromText(fullText, 'Authority') ||
    'Government Body (see notification)';
  const conductingBody = sanitizeExamText(conductingBodyRaw, 220);

  const category = inferExamCategory({ name: title, url });

  return {
    name: title || 'Government Exam',
    conductingBody: conductingBody || 'See notification',
    category,
    minAge,
    maxAge,
    educationRequired,
    totalPosts,
    applicationStart,
    applicationEnd,
    examDate,
  };
}

async function scrapeLatestJobs(limit) {
  console.log(`Fetching latest jobs from ${LATEST_JOB_URL}`);
  const res = await axios.get(LATEST_JOB_URL, { timeout: 20000 });
  const html = res.data;
  const $ = cheerio.load(html);

  const jobs = [];

  $('li a').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    const text = $a.text().trim();
    if (!href || !text) return;
    if (!/Online Form/i.test(text)) return;
    if (!href.startsWith('http')) return;
    const parentText = $a.parent().text();
    const lastDateRaw = extractFromText(parentText, 'Last Date');
    jobs.push({
      title: text,
      url: href,
      lastDateRaw,
    });
  });

  const uniqueJobs = [];
  const seen = new Set();
  for (const j of jobs) {
    if (seen.has(j.url)) continue;
    seen.add(j.url);
    uniqueJobs.push(j);
    if (uniqueJobs.length >= limit) break;
  }

  console.log(`Found ${uniqueJobs.length} potential jobs with Online Form`);
  return uniqueJobs;
}

async function upsertExamAndCycle(job) {
  const detail = await parseJobDetail(job.url);

  const examName = detail.name || job.title;

  // Prefer unique mapping by source URL
  let exam =
    (await Exam.findOne({ source: 'sarkariresult', sourceUrl: job.url })) ||
    (await Exam.findOne({ name: examName }));

  if (!exam) {
    exam = await Exam.create({
      name: examName,
      conductingBody: detail.conductingBody || 'See notification',
      minAge: detail.minAge,
      maxAge: detail.maxAge,
      educationRequired: detail.educationRequired || 'See notification',
      totalPosts: detail.totalPosts || null,
      category: detail.category || null,
      officialWebsite: job.url,
      source: 'sarkariresult',
      sourceUrl: job.url,
    });
    console.log(`Created exam: ${exam.name}`);
  } else {
    let touched = false;
    if (!exam.source || !exam.sourceUrl) {
      exam.source = 'sarkariresult';
      exam.sourceUrl = job.url;
      touched = true;
    }
    if (detail.educationRequired && detail.educationRequired !== 'See notification') {
      exam.educationRequired = detail.educationRequired;
      touched = true;
    }
    if (detail.totalPosts && !exam.totalPosts) {
      exam.totalPosts = detail.totalPosts;
      touched = true;
    }
    if (detail.category && (!exam.category || exam.category === 'Other')) {
      exam.category = detail.category;
      touched = true;
    }
    if (touched) {
      await exam.save();
      console.log(`Updated existing exam from source: ${exam.name}`);
    } else {
      console.log(`Using existing exam: ${exam.name}`);
    }
  }

  const applicationEnd =
    detail.applicationEnd || parseIndianDate(job.lastDateRaw) || new Date(Date.now() + 7 * 86400000);
  const applicationStart = detail.applicationStart || new Date();
  const examDate = detail.examDate || applicationEnd;

  const existingCycle = await ExamCycle.findOne({
    examId: exam._id,
    applyLink: job.url,
    applicationStart,
    applicationEnd,
  });

  if (existingCycle) {
    console.log(`Existing cycle found for ${exam.name}, skipping`);
    return { exam, cycle: existingCycle, created: false };
  }

  const cycle = await ExamCycle.create({
    examId: exam._id,
    applicationStart,
    applicationEnd,
    examDate,
    applyLink: job.url,
    notificationPdf: null,
  });
  console.log(`Created exam cycle for ${exam.name} (end ${applicationEnd.toISOString().slice(0, 10)})`);

  return { exam, cycle, created: true };
}

async function runSarkariScraper({ limit = 40 } = {}) {
  const jobs = await scrapeLatestJobs(limit);
  let createdExams = 0;
  let createdCycles = 0;
  let skippedCycles = 0;

  for (const job of jobs) {
    try {
      const { exam, created } = await upsertExamAndCycle(job);
      if (created) {
        createdCycles += 1;
        if (exam.createdAt.getTime() === exam.updatedAt.getTime()) {
          createdExams += 1;
        }
      } else {
        skippedCycles += 1;
      }
    } catch (e) {
      console.error('Failed to import job', job.title, e.message);
    }
  }

  return {
    jobsProcessed: jobs.length,
    createdExams,
    createdCycles,
    skippedCycles,
  };
}

module.exports = { runSarkariScraper };

