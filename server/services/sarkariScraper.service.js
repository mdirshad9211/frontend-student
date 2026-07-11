/* eslint-disable no-console */
const axios = require('axios');
const cheerio = require('cheerio');
const Exam = require('../models/Exam');
const ExamCycle = require('../models/ExamCycle');
const { sanitizeExamText } = require('../utils/sanitizeExamText');
const { inferExamCategory } = require('../utils/inferExamCategory');
const { inferExamStates } = require('../utils/inferExamStates');
const { notifyAppliedUsersForExamUpdate } = require('./examUpdateNotification.service');

const ROOT = 'https://www.sarkariresult.com';
const LATEST_JOB_URL = `${ROOT}/latestjob/`;
const RESULT_URL = `${ROOT}/results/`;
const ADMIT_CARD_URL = `${ROOT}/admitcard/`;

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

function normalizeTitle(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(online|form|result|admit|card|download|link|latest|new)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeTitle(value) {
  return normalizeTitle(value)
    .split(' ')
    .filter((x) => x && x.length > 2);
}

function scoreNameMatch(a, b) {
  const aa = tokenizeTitle(a);
  const bb = new Set(tokenizeTitle(b));
  if (!aa.length || !bb.size) return 0;
  let hits = 0;
  for (const t of aa) {
    if (bb.has(t)) hits += 1;
  }
  return hits / Math.max(aa.length, 1);
}

function isExternalApplyUrl(href, pageUrl) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null;
  try {
    const full = new URL(href, pageUrl).toString();
    const host = new URL(full).hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('sarkariresult.com')) return null;
    return full;
  } catch {
    return null;
  }
}

function extractReadablePageText($) {
  $('script, style, noscript, iframe, nav, footer, header').remove();
  const container =
    $('.entry-content').first() ||
    $('.post').first() ||
    $('.content').first() ||
    $('.article').first() ||
    $('body').first();
  const text = (container && container.length ? container : $('body')).text();
  return text.replace(/\s+/g, ' ').trim();
}

function rankApplyUrl(href) {
  try {
    const host = new URL(href).hostname.toLowerCase();
    if (/\.gov\.in$/.test(host) || /\.nic\.in$/.test(host)) return 2;
    return 1;
  } catch {
    return 0;
  }
}

/**
 * Extract the official apply URL from the "Apply Online" / "Click here" section.
 * SarkariResult often has: table row with "Apply Online" text and a "Click here" link in same row.
 * We never return sarkariresult.com; only the actual portal link.
 */
function extractOfficialApplyUrl($, pageUrl) {
  let best = { url: null, rank: 0 };

  function consider(url) {
    if (!url) return;
    const r = rankApplyUrl(url);
    if (r > best.rank || (r === best.rank && !best.url)) best = { url, rank: r };
  }

  // 1) Table row containing "Apply Online" or "How to Apply" – link in same row is usually the official one
  $('tr').each((_, tr) => {
    const $tr = $(tr);
    const rowText = $tr.text().replace(/\s+/g, ' ').toLowerCase();
    if (!rowText.includes('apply') || (!rowText.includes('online') && !rowText.includes('how to apply') && !rowText.includes('link'))) return;
    $tr.find('a[href]').each((_, a) => {
      const href = $(a).attr('href');
      const full = isExternalApplyUrl(href, pageUrl);
      if (full) consider(full);
    });
  });

  // 2) Any link whose text is exactly "Click here" / "Click Here" (the standard text on SarkariResult)
  $('a[href]').each((_, el) => {
    const $a = $(el);
    const text = $a.text().replace(/\s+/g, ' ').trim().toLowerCase();
    if (text !== 'click here' && text !== 'click here to apply' && text !== 'here') return;
    const full = isExternalApplyUrl($a.attr('href'), pageUrl);
    if (full) consider(full);
  });

  // 3) Links inside elements that contain "Apply Online" or "How to Apply" in their text
  $('a[href]').each((_, el) => {
    const $a = $(el);
    const container = $a.closest('table, .post, .entry-content, .content, .job-detail, .article, div');
    const blockText = (container.length ? container.first() : $a.parent()).text().replace(/\s+/g, ' ').toLowerCase();
    const hasApply = blockText.includes('apply online') || blockText.includes('how to apply') || blockText.includes('apply link');
    if (!hasApply) return;
    const full = isExternalApplyUrl($a.attr('href'), pageUrl);
    if (full) consider(full);
  });

  // 4) Fallback: any .gov.in or .nic.in link on the page (government official sites)
  if (!best.url) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const full = isExternalApplyUrl(href, pageUrl);
      if (!full) return;
      try {
        const host = new URL(full).hostname.toLowerCase();
        if (/\.gov\.in$/.test(host) || /\.nic\.in$/.test(host)) {
          consider(full);
          return false;
        }
      } catch {}
    });
  }

  return best.url || null;
}

function extractOfficialUpdateUrl($, pageUrl, type) {
  const typeWords =
    type === 'result'
      ? ['result', 'score card', 'marks', 'download result']
      : ['admit card', 'hall ticket', 'call letter', 'download admit'];

  let best = { url: null, rank: 0 };
  function consider(url) {
    if (!url) return;
    const r = rankApplyUrl(url);
    if (r > best.rank || (r === best.rank && !best.url)) best = { url, rank: r };
  }

  $('tr').each((_, tr) => {
    const $tr = $(tr);
    const rowText = $tr.text().replace(/\s+/g, ' ').toLowerCase();
    if (!typeWords.some((w) => rowText.includes(w))) return;
    $tr.find('a[href]').each((__, a) => {
      const full = isExternalApplyUrl($(a).attr('href'), pageUrl);
      if (full) consider(full);
    });
  });

  $('a[href]').each((_, a) => {
    const $a = $(a);
    const t = $a.text().replace(/\s+/g, ' ').trim().toLowerCase();
    const nearby = $a.closest('tr, p, li, div, td').text().replace(/\s+/g, ' ').toLowerCase();
    const hasKeyword = typeWords.some((w) => t.includes(w) || nearby.includes(w));
    if (!hasKeyword && t !== 'click here' && t !== 'download') return;
    const full = isExternalApplyUrl($a.attr('href'), pageUrl);
    if (full) consider(full);
  });

  return best.url || null;
}

async function parseJobDetail(url) {
  const res = await axios.get(url, { timeout: 20000 });
  const html = res.data;
  const $ = cheerio.load(html);
  const fullText = extractReadablePageText($);

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
  const states = inferExamStates(`${title} ${fullText}`);
  const officialApplyUrl = extractOfficialApplyUrl($, url);
  const details = sanitizeExamText(fullText, 2400);

  return {
    name: title || 'Government Exam',
    conductingBody: conductingBody || 'See notification',
    category,
    states,
    minAge,
    maxAge,
    educationRequired,
    totalPosts,
    applicationStart,
    applicationEnd,
    examDate,
    officialApplyUrl,
    details,
  };
}

async function scrapeListingSection({ pageUrl, includePattern, limit, kind }) {
  const res = await axios.get(pageUrl, { timeout: 20000 });
  const html = res.data;
  const $ = cheerio.load(html);
  const items = [];

  $('li a').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    const text = $a.text().trim();
    if (!href || !text) return;
    if (!href.startsWith('http')) return;
    if (includePattern && !includePattern.test(text)) return;
    items.push({ title: text, url: href, officialUrl: null });
  });

  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    uniqueItems.push(item);
    if (uniqueItems.length >= limit) break;
  }

  for (const item of uniqueItems) {
    try {
      const resDetail = await axios.get(item.url, { timeout: 20000 });
      const $$ = cheerio.load(resDetail.data);
      if (kind === 'result' || kind === 'admit_card') {
        item.officialUrl = extractOfficialUpdateUrl($$, item.url, kind);
      }
    } catch (e) {
      console.error('Failed to resolve official link for update item', item.title, e.message);
    }
  }

  return uniqueItems;
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

async function scrapeLatestResults(limit) {
  console.log(`Fetching latest results from ${RESULT_URL}`);
  return scrapeListingSection({ pageUrl: RESULT_URL, includePattern: /Result|Download/i, limit, kind: 'result' });
}

async function scrapeLatestAdmitCards(limit) {
  console.log(`Fetching latest admit cards from ${ADMIT_CARD_URL}`);
  return scrapeListingSection({ pageUrl: ADMIT_CARD_URL, includePattern: /Admit Card|Hall Ticket|Call Letter/i, limit, kind: 'admit_card' });
}

async function findMatchingExamForUpdate(item) {
  const candidates = await Exam.find({}, { name: 1, sourceUrl: 1 }).lean();
  if (!candidates.length) return null;

  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    if (c.sourceUrl && item.url && c.sourceUrl === item.url) {
      return c;
    }
    const s = scoreNameMatch(item.title, c.name);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }

  if (!best || bestScore < 0.35) return null;
  return best;
}

async function upsertExamAndCycle(job) {
  const detail = await parseJobDetail(job.url);

  const examName = detail.name || job.title;

  // Prefer unique mapping by source URL
  let exam =
    (await Exam.findOne({ source: 'sarkariresult', sourceUrl: job.url })) ||
    (await Exam.findOne({ name: examName }));

  if (!exam) {
    const officialWebsite =
      detail.officialApplyUrl && typeof detail.officialApplyUrl === 'string'
        ? detail.officialApplyUrl
        : null;

    exam = await Exam.create({
      name: examName,
      conductingBody: detail.conductingBody || 'See notification',
      minAge: detail.minAge,
      maxAge: detail.maxAge,
      educationRequired: detail.educationRequired || 'See notification',
      totalPosts: detail.totalPosts || null,
      category: detail.category || null,
      states: Array.isArray(detail.states) ? detail.states : [],
      officialWebsite,
      details: detail.details || null,
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
    if (Array.isArray(detail.states) && detail.states.length > 0) {
      exam.states = detail.states;
      touched = true;
    }
    if (detail.officialApplyUrl) {
      exam.officialWebsite = detail.officialApplyUrl;
      touched = true;
    } else if (exam.officialWebsite && String(exam.officialWebsite).includes('sarkariresult.com')) {
      exam.officialWebsite = null;
      touched = true;
    }
    if (detail.details && !exam.details) {
      exam.details = detail.details;
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
  const applyLink =
    (detail.officialApplyUrl && typeof detail.officialApplyUrl === 'string' && detail.officialApplyUrl) || null;

  const existingCycle = await ExamCycle.findOne({
    examId: exam._id,
    applyLink,
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
    applyLink,
    notificationPdf: null,
  });
  console.log(`Created exam cycle for ${exam.name} (end ${applicationEnd.toISOString().slice(0, 10)})`);

  return { exam, cycle, created: true };
}

async function upsertExamUpdate({ item, type }) {
  const matched = await findMatchingExamForUpdate(item);
  if (!matched) return { matched: false, notified: 0 };

  const exam = await Exam.findById(matched._id);
  if (!exam) return { matched: false, notified: 0 };

  let changed = false;
  const safeOfficialUpdateLink =
    item.officialUrl && !String(item.officialUrl).toLowerCase().includes('sarkariresult.com')
      ? item.officialUrl
      : null;
  let updateLink = null;
  let updateDate = new Date();
  if (type === 'result') {
    if (safeOfficialUpdateLink && exam.latestResultLink !== safeOfficialUpdateLink) {
      exam.latestResultLink = safeOfficialUpdateLink;
      exam.latestResultDeclaredAt = updateDate;
      changed = true;
    } else if (!safeOfficialUpdateLink && exam.latestResultLink && String(exam.latestResultLink).includes('sarkariresult.com')) {
      exam.latestResultLink = null;
      changed = true;
    }
    updateLink = exam.latestResultLink;
    updateDate = exam.latestResultDeclaredAt || updateDate;
  } else {
    if (safeOfficialUpdateLink && exam.latestAdmitCardLink !== safeOfficialUpdateLink) {
      exam.latestAdmitCardLink = safeOfficialUpdateLink;
      exam.latestAdmitCardReleasedAt = updateDate;
      changed = true;
    } else if (!safeOfficialUpdateLink && exam.latestAdmitCardLink && String(exam.latestAdmitCardLink).includes('sarkariresult.com')) {
      exam.latestAdmitCardLink = null;
      changed = true;
    }
    updateLink = exam.latestAdmitCardLink;
    updateDate = exam.latestAdmitCardReleasedAt || updateDate;
  }

  if (!changed) return { matched: true, changed: false, notified: 0 };

  await exam.save();
  const { notified } = await notifyAppliedUsersForExamUpdate({
    exam,
    updateType: type,
    link: updateLink,
    date: updateDate,
  });
  return { matched: true, changed: true, notified };
}

async function runSarkariScraper({ limit = 40 } = {}) {
  const jobs = await scrapeLatestJobs(limit);
  const results = await scrapeLatestResults(limit);
  const admitCards = await scrapeLatestAdmitCards(limit);
  let createdExams = 0;
  let createdCycles = 0;
  let skippedCycles = 0;
  let resultUpdates = 0;
  let admitCardUpdates = 0;
  let notificationsCreated = 0;

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

  for (const item of results) {
    try {
      const out = await upsertExamUpdate({ item, type: 'result' });
      if (out.changed) {
        resultUpdates += 1;
        notificationsCreated += out.notified || 0;
      }
    } catch (e) {
      console.error('Failed to import result update', item.title, e.message);
    }
  }

  for (const item of admitCards) {
    try {
      const out = await upsertExamUpdate({ item, type: 'admit_card' });
      if (out.changed) {
        admitCardUpdates += 1;
        notificationsCreated += out.notified || 0;
      }
    } catch (e) {
      console.error('Failed to import admit card update', item.title, e.message);
    }
  }

  return {
    jobsProcessed: jobs.length,
    resultsProcessed: results.length,
    admitCardsProcessed: admitCards.length,
    createdExams,
    createdCycles,
    skippedCycles,
    resultUpdates,
    admitCardUpdates,
    notificationsCreated,
  };
}

module.exports = { runSarkariScraper };

