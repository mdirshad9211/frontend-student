/**
 * Strip script snippets, ad code, and noisy patterns from scraped exam text
 * so it's safe to store and display (no raw HTML/JS in UI).
 */
function sanitizeExamText(value, maxLength = 500) {
  if (value == null || typeof value !== 'string') return '';
  let s = value
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
    .replace(/WWW\.SARKARIRESULT\.COM/gi, ' ')
    .replace(/SARKARI\s*RESULT/gi, ' ')
    .trim();
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
