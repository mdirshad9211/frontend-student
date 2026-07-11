/**
 * Strip script snippets, ad code, and noisy patterns from scraped exam text
 * so it's safe to store and display (no raw HTML/JS in UI).
 */
function sanitizeExamText(value, maxLength = 500) {
  if (value == null || typeof value !== 'string') return '';
  let s = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\(adsbygoogle\s*=\s*window\.adsbygoogle[^)]*\);[^)]*\)?\s*;?/gi, ' ')
    .replace(/window\.adsbygoogle[^;]*;/gi, ' ')
    .replace(/createElement\s*\(\s*['"]script['"][^)]*\)/gi, ' ')
    .replace(/\.push\s*\(\s*\{\s*\}\s*\)/g, ' ')
    .replace(/d\.head\.appendChild\s*\([^)]*\)/gi, ' ')
    .replace(/ai\.(src|async|defer)[^;]*/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/\[[\s\S]*?\]\.push\s*\(/g, ' ')
    .replace(/\{[^{}]*\s*slot[^{}]*\}[^;]*/gi, ' ')
    // Common leftover script snippet pattern from SarkariResult pages
    .replace(/function\s*\(\s*d\s*,\s*o\s*,\s*a\s*,\s*l\s*\)[^)]*/gi, ' ')
    .replace(/WWW\.SARKARIRESULT\.COM/gi, ' ')
    .replace(/SARKARI\s*RESULT/gi, ' ')
    .replace(/Skip to content/gi, ' ')
    .replace(
      /Menu\s+Home\s+Latest\s+job\s+Admit\s+Card\s+Results\s+Admission\s+UP\s+Scholarship\s+Syllabus\s+More\s+About\s+Us\s+Terms\s+And\s+Conditions\s+Contact\s+Us/gi,
      ' '
    )
    .replace(/\bMenu\s+Home\s+Latest\s+job\s+Admit\s+Card\s+Results\b/gi, ' ')
    .replace(/\.[a-z0-9_-]+\s*\{[^{}]*\}/gi, ' ')
    .replace(/@[a-z-]+\s*\([^)]*\)\s*\{[^{}]*\}/gi, ' ')
    .replace(/\(function\s*\([^)]*\)\s*\{[\s\S]*?\}\)\s*\([^)]*\);?/gi, ' ')
    .replace(/\b(Telegram\s+Join\s+Us|WhatsApp\s+Join\s+Us|Instagram\s+Follow|X\s+Follow)\b/gi, ' ')
    .replace(/https?:\/\/\s*\/wp-content\/[\w\-./?=&]+/gi, ' ')
    .trim();

  const postStart = s.search(/\b(Name\s+Of\s+Post\s*:|Short\s+Information\b|Important\s+Dates\b)/i);
  if (postStart > 80) {
    s = s.slice(postStart);
  }

  // Remove any remaining fragments that look like code
  s = s.replace(/\b(ai|d)\s*=\s*\w+\.createElement/g, ' ').replace(/\s+/g, ' ').trim();
  if (maxLength > 0 && s.length > maxLength) {
    s = s.slice(0, maxLength - 1).trim();
    if (s.length > 0) s += '…';
  }
  return s;
}

/**
 * For display: strict length and one more pass for safety.
 */
function sanitizeForDisplay(value, maxLength = 200) {
  const s = sanitizeExamText(value, maxLength);
  return s.slice(0, maxLength);
}

module.exports = { sanitizeExamText, sanitizeForDisplay };
