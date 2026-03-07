/**
 * Education levels and degree-aware eligibility.
 * Supports specific degrees (B.A, B.Sc, B.Tech, etc.) for accurate job matching.
 */

// Rank order: 0 = 10th, 1 = 12th, 2 = diploma, 3 = graduation, 4 = post-graduation, 5 = phd
const RANK_10TH = 0;
const RANK_12TH = 1;
const RANK_DIPLOMA = 2;
const RANK_GRADUATION = 3;
const RANK_POST_GRAD = 4;
const RANK_PHD = 5;

// Normalized value -> rank (for user profile dropdown values)
const VALUE_TO_RANK = {
  '10th': RANK_10TH,
  '12th': RANK_12TH,
  diploma: RANK_DIPLOMA,
  graduation: RANK_GRADUATION,
  'b.a': RANK_GRADUATION,
  'b.sc': RANK_GRADUATION,
  'b.tech': RANK_GRADUATION,
  'b.e': RANK_GRADUATION,
  'b.com': RANK_GRADUATION,
  bba: RANK_GRADUATION,
  bca: RANK_GRADUATION,
  llb: RANK_GRADUATION,
  'b.ed': RANK_GRADUATION,
  other_graduate: RANK_GRADUATION,
  post_graduation: RANK_POST_GRAD,
  'm.a': RANK_POST_GRAD,
  'm.sc': RANK_POST_GRAD,
  'm.tech': RANK_POST_GRAD,
  'm.e': RANK_POST_GRAD,
  mba: RANK_POST_GRAD,
  other_pg: RANK_POST_GRAD,
  phd: RANK_PHD,
};

// Aliases: user selects "B.Tech / B.E" -> we store "b.tech"; required text "B.E" -> normalizes to "b.e"
// So we need to treat b.tech and b.e as equivalent for "B.Tech or B.E" requirement
const DEGREE_ALIASES = {
  'b.e': ['b.tech', 'b.e'],
  'b.tech': ['b.tech', 'b.e'],
  'm.e': ['m.tech', 'm.e'],
  'm.tech': ['m.tech', 'm.e'],
};

// Regex patterns to extract degree/level from requirement text (case-insensitive)
const PATTERNS = {
  level10: /\b(10th|10\s*th|matriculation|matric)\b/i,
  level12: /\b(12th|12\s*th|intermediate|higher\s*secondary|hsc)\b/i,
  diploma: /\b(diploma)\b/i,
  grad: /\b(graduate|graduation|bachelor|b\.?\s*a\.?|b\.?\s*sc\.?|b\.?\s*tech|b\.?\s*e\.?|b\.?\s*com|bba|bca|llb|b\.?\s*ed\.?|b\.?\s*ed\b)\b/i,
  pg: /\b(post\s*graduate|postgraduate|master|m\.?\s*a\.?|m\.?\s*sc\.?|m\.?\s*tech|m\.?\s*e\.?|mba|m\.?\s*com)\b/i,
  phd: /\b(phd|doctorate|d\.?\s*phil)\b/i,
};

// Extract degree keywords from requirement text for exact/specific matching
function extractDegreeKeywords(text) {
  if (!text || typeof text !== 'string') return new Set();
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  const set = new Set();

  const pairs = [
    [/\bb\.?\s*a\.?\b/g, 'b.a'],
    [/\bb\.?\s*sc\.?\b/g, 'b.sc'],
    [/\bb\.?\s*tech\.?\b/g, 'b.tech'],
    [/\bb\.?\s*e\.?\b/g, 'b.e'],
    [/\bb\.?\s*com\.?\b/g, 'b.com'],
    [/\bbba\b/g, 'bba'],
    [/\bbca\b/g, 'bca'],
    [/\bllb\b/g, 'llb'],
    [/\bb\.?\s*ed\.?\b/g, 'b.ed'],
    [/\bm\.?\s*a\.?\b/g, 'm.a'],
    [/\bm\.?\s*sc\.?\b/g, 'm.sc'],
    [/\bm\.?\s*tech\.?\b/g, 'm.tech'],
    [/\bm\.?\s*e\.?\b/g, 'm.e'],
    [/\bmba\b/g, 'mba'],
  ];

  for (const [regex, key] of pairs) {
    if (regex.test(normalized)) set.add(key);
  }
  return set;
}

// Parse requirement text to get minimum level and any specific degree keywords
function parseRequiredEducation(requiredStr) {
  if (!requiredStr || typeof requiredStr !== 'string') {
    return { level: null, degreeKeys: new Set(), vague: true };
  }
  const text = requiredStr.trim().toLowerCase();
  if (text.length < 3 || /see\s*notification|refer\s*to|as\s*per\s*notification/i.test(text)) {
    return { level: null, degreeKeys: new Set(), vague: true };
  }

  const degreeKeys = extractDegreeKeywords(requiredStr);
  let level = null;

  if (PATTERNS.phd.test(text)) level = RANK_PHD;
  else if (PATTERNS.pg.test(text)) level = level ?? RANK_POST_GRAD;
  if (PATTERNS.grad.test(text)) level = level ?? RANK_GRADUATION;
  if (PATTERNS.diploma.test(text)) level = level ?? RANK_DIPLOMA;
  if (PATTERNS.level12.test(text)) level = level ?? RANK_12TH;
  if (PATTERNS.level10.test(text)) level = level ?? RANK_10TH;

  // If we found degree keywords but no level, assume graduation level
  if (degreeKeys.size > 0 && level === null) level = RANK_GRADUATION;
  for (const k of degreeKeys) {
    if (VALUE_TO_RANK[k] === RANK_POST_GRAD) level = RANK_POST_GRAD;
  }

  return { level, degreeKeys, vague: false };
}

function normalizeEducation(value) {
  if (!value) return '';
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function getRank(userEducation) {
  const norm = normalizeEducation(userEducation);
  if (!norm) return null;
  if (VALUE_TO_RANK[norm] !== undefined) return VALUE_TO_RANK[norm];
  // Map common display values
  const map = {
    'graduation (any)': RANK_GRADUATION,
    'post graduation (any)': RANK_POST_GRAD,
    'b.tech / b.e': RANK_GRADUATION,
    'm.tech / m.e': RANK_POST_GRAD,
  };
  return map[norm] ?? null;
}

// Normalize user's education to a key that can be matched against degreeKeys (e.g. "B.Tech" -> "b.tech")
function getUserDegreeKey(userEducation) {
  const norm = normalizeEducation(userEducation);
  if (!norm) return null;
  if (VALUE_TO_RANK[norm] !== undefined) return norm;
  const displayToKey = {
    'graduation (any)': 'graduation',
    'post graduation (any)': 'post_graduation',
    'b.tech / b.e': 'b.tech',
    'm.tech / m.e': 'm.tech',
  };
  return displayToKey[norm] ?? norm;
}

/**
 * Check if user's education satisfies the requirement.
 * - Vague requirement ("see notification") -> eligible (user can check manually).
 * - Level-only (e.g. "Graduation") -> user rank >= required level.
 * - Specific degrees (e.g. "B.Tech or B.E") -> user's degree in set OR user rank strictly higher.
 */
function isEducationEligible(userEducation, requiredEducation) {
  if (!userEducation || !String(userEducation).trim()) return false;

  const parsed = parseRequiredEducation(requiredEducation);
  const userRank = getRank(userEducation);
  const userKey = getUserDegreeKey(userEducation);

  if (parsed.vague) return true;

  if (userRank === null) {
    // User value not in our list - try exact substring match for required text
    const reqNorm = normalizeEducation(requiredEducation);
    const userNorm = normalizeEducation(userEducation);
    return reqNorm && userNorm && requiredEducation.toLowerCase().includes(userNorm);
  }

  // Specific degrees mentioned in requirement
  if (parsed.degreeKeys.size > 0) {
    if (userKey && parsed.degreeKeys.has(userKey)) return true;
    if (userKey && DEGREE_ALIASES[userKey]) {
      for (const alias of DEGREE_ALIASES[userKey]) {
        if (parsed.degreeKeys.has(alias)) return true;
      }
    }
    if (parsed.level !== null && userRank > parsed.level) return true;
    return false;
  }

  // Level-only requirement
  if (parsed.level !== null) return userRank >= parsed.level;
  return true;
}

/**
 * Explicit degree-key based eligibility, used when admin selects multiple degrees.
 * requiredKeys: array like ['b.tech', 'b.sc'].
 */
function isEducationEligibleForKeys(userEducation, requiredKeys) {
  if (!userEducation || !String(userEducation).trim()) return false;
  if (!Array.isArray(requiredKeys) || requiredKeys.length === 0) {
    return isEducationEligible(userEducation, null);
  }

  const userRank = getRank(userEducation);
  const userKey = getUserDegreeKey(userEducation);
  if (userRank === null) return false;

  const keySet = new Set(requiredKeys.map((k) => normalizeEducation(k)));

  if (userKey && keySet.has(userKey)) return true;
  if (userKey && DEGREE_ALIASES[userKey]) {
    for (const alias of DEGREE_ALIASES[userKey]) {
      if (keySet.has(alias)) return true;
    }
  }

  let minRank = Infinity;
  for (const k of keySet) {
    const r = VALUE_TO_RANK[k];
    if (typeof r === 'number' && r < minRank) minRank = r;
  }
  if (minRank !== Infinity && userRank > minRank) return true;
  return false;
}

// Options for profile dropdown: { value, label }
const EDUCATION_OPTIONS = [
  { value: '10th', label: '10th / Matriculation' },
  { value: '12th', label: '12th / Intermediate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduation', label: 'Graduation (any discipline)' },
  { value: 'b.a', label: 'B.A' },
  { value: 'b.sc', label: 'B.Sc' },
  { value: 'b.tech', label: 'B.Tech / B.E' },
  { value: 'b.com', label: 'B.Com' },
  { value: 'bba', label: 'BBA' },
  { value: 'bca', label: 'BCA' },
  { value: 'llb', label: 'LLB' },
  { value: 'b.ed', label: 'B.Ed' },
  { value: 'other_graduate', label: 'Other Graduate' },
  { value: 'post_graduation', label: 'Post Graduation (any)' },
  { value: 'm.a', label: 'M.A' },
  { value: 'm.sc', label: 'M.Sc' },
  { value: 'm.tech', label: 'M.Tech / M.E' },
  { value: 'mba', label: 'MBA' },
  { value: 'other_pg', label: 'Other Post Graduate' },
  { value: 'phd', label: 'PhD' },
];

// Legacy: flat list of level-only for backward compatibility
const EDUCATION_LEVELS = ['10th', '12th', 'diploma', 'graduation', 'post_graduation', 'phd'];

module.exports = {
  EDUCATION_LEVELS,
  EDUCATION_OPTIONS,
  isEducationEligible,
  isEducationEligibleForKeys,
  normalizeEducation,
  parseRequiredEducation,
  getRank,
};
