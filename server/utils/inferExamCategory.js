/**
 * Infers exam category from name and URL using regex patterns.
 * Used by scraper and by exams service to fill category when missing.
 */

// First path segment (e.g. /upsc/... -> 'upsc'). Used for URL-based rules.
function getTopPathDir(path) {
  const segments = (path || '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return (segments[0] || '').toLowerCase();
}

// Order matters: more specific patterns first. All patterns are case-insensitive.
const CATEGORY_RULES = [
  // URL path segment – strong signal from sarkariresult.com (e.g. /upsc/, /bank/)
  { test: (_, path) => getTopPathDir(path) === 'upsc', category: 'UPSC' },
  { test: (_, path) => getTopPathDir(path) === 'ssc', category: 'SSC' },
  { test: (_, path) => ['railway', 'rrb', 'rrc'].includes(getTopPathDir(path)), category: 'Railway' },
  { test: (_, path) => ['bank', 'banking'].includes(getTopPathDir(path)), category: 'Banking' },
  { test: (_, path) => ['force', 'defence', 'army', 'navy', 'airforce'].includes(getTopPathDir(path)), category: 'Defence' },
  { test: (_, path) => getTopPathDir(path) === 'police', category: 'Police' },
  { test: (_, path) => ['teaching', 'teacher', 'education'].includes(getTopPathDir(path)), category: 'Teaching' },
  { test: (_, path) => ['translator', 'translation'].includes(getTopPathDir(path)), category: 'Translator' },

  // Name + path combined regex (word boundaries where useful)
  { test: (name) => /\bupsc\b|union\s*public\s*service\s*commission|civil\s*services\s*exam/i.test(name || ''), category: 'UPSC' },
  { test: (name) => /\bssc\b|staff\s*selection\s*commission|ssc\s*cgl|ssc\s*chsl|ssc\s*gd|ssc\s*mts/i.test(name || ''), category: 'SSC' },
  { test: (name) => /\brailway\b|\brrb\b|\brrc\b|railway\s*recruitment|metro\s*rail|rrb\s*ntpc|rrb\s*alp|rrb\s*group\s*d/i.test(name || ''), category: 'Railway' },
  {
    test: (name) =>
      /\bbank\b|\bibps\b|\bsbi\b|\brbi\b|canara\s*bank|uco\s*bank|union\s*bank|bank\s*po|bank\s*clerk|bank\s*exam|insurance\s*exam/i.test(name || ''),
    category: 'Banking',
  },
  {
    test: (name) =>
      /\btranslator\b|junior\s*translator|jht\b|translation\s*exam|hindi\s*translator|english\s*translator/i.test(name || ''),
    category: 'Translator',
  },
  {
    test: (name) =>
      /\bpolice\b|constable|sub\s*inspector|si\s*recruitment|delhi\s*police|state\s*police|police\s*recruitment/i.test(name || ''),
    category: 'Police',
  },
  {
    test: (name) =>
      /\barmy\b|\bnavy\b|air\s*force|agniveer|coast\s*guard|\bbsf\b|\bcrpf\b|\bcisf\b|\bitbp\b|paramilitary|defence\s*exam/i.test(name || ''),
    category: 'Defence',
  },
  {
    test: (name) =>
      /\bteacher\b|\btgt\b|\bpgt\b|lecturer|professor|teaching\s*exam|kvs\s*recruitment|nvs\s*recruitment|dsssb\s*teacher/i.test(name || ''),
    category: 'Teaching',
  },
  {
    test: (name) =>
      /\bpsc\b|public\s*service\s*commission|state\s*psc|\brpsc\b|\bbpsc\b|\bmppsc\b|\buppsc\b|\bmpsc\b|state\s*commission/i.test(name || ''),
    category: 'State PSC',
  },
  { test: (name) => /\bcss\b|central\s*secretariat|css\s*exam/i.test(name || ''), category: 'UPSC' },
];

function getPathFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url);
    return (u.pathname || '').toLowerCase();
  } catch {
    return (url || '').toLowerCase();
  }
}

/**
 * Infer category from exam name and optional URL.
 * @param {{ name?: string, url?: string }} opts - name and url (e.g. officialWebsite or sourceUrl)
 * @returns {string} - One of: UPSC, SSC, Railway, Banking, Translator, Police, Defence, Teaching, State PSC, Other
 */
function inferExamCategory({ name = '', url = '' }) {
  const path = getPathFromUrl(url);
  const combinedName = `${name} ${path}`.trim();

  for (const rule of CATEGORY_RULES) {
    if (rule.test(combinedName, path)) {
      return rule.category;
    }
  }

  return 'Other';
}

module.exports = { inferExamCategory, getPathFromUrl };
