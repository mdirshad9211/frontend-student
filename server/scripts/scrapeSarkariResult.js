/* eslint-disable no-console */
const axios = require('axios');
const cheerio = require('cheerio');
const { connectDB } = require('../config/db');
const { env } = require('../config/env');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');

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

async function parseJobDetail(url) {
  const res = await axios.get(url, { timeout: 20000 });
  const html = res.data;
  const $ = cheerio.load(html);
  const fullText = $('body').text().replace(/\s+/g, ' ').trim();

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

  const title = $('h1').first().text().trim() || $('title').text().trim();
  const conductingBody =
    $('h2').first().text().trim() ||
    extractFromText(fullText, 'Authority') ||
    'Government Body (see notification)';

  return {
    name: title || 'Government Exam',
    conductingBody,
    minAge,
    maxAge,
    applicationStart,
    applicationEnd,
    examDate,
  };
}

async function scrapeLatestJobs(limit = 40) {
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

  let exam = await Exam.findOne({ name: examName });
  if (!exam) {
    exam = await Exam.create({
      name: examName,
      conductingBody: detail.conductingBody || 'See notification',
      minAge: detail.minAge,
      maxAge: detail.maxAge,
      educationRequired: 'See notification',
      category: null,
      officialWebsite: job.url,
    });
    console.log(`Created exam: ${exam.name}`);
  } else {
    console.log(`Using existing exam: ${exam.name}`);
  }

  const applicationEnd =
    detail.applicationEnd || parseIndianDate(job.lastDateRaw) || new Date(Date.now() + 7 * 86400000);
  const applicationStart = detail.applicationStart || new Date();
  const examDate = detail.examDate || applicationEnd;

  const cycle = await ExamCycle.create({
    examId: exam._id,
    applicationStart,
    applicationEnd,
    examDate,
    applyLink: job.url,
    notificationPdf: null,
  });
  console.log(`Created exam cycle for ${exam.name} (end ${applicationEnd.toISOString().slice(0, 10)})`);

  return { exam, cycle };
}

async function main() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI not configured');
  }
  await connectDB(env.MONGO_URI);

  const limit = Number(process.env.SARKARI_LIMIT || '40');
  const jobs = await scrapeLatestJobs(limit);

  for (const job of jobs) {
    try {
      await upsertExamAndCycle(job);
    } catch (e) {
      console.error('Failed to import job', job.title, e.message);
    }
  }

  console.log('Scrape complete');
  process.exit(0);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

