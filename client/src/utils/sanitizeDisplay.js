/**
 * Client-side safety: strip script-like snippets and limit length for display.
 * Use for exam name, conductingBody, educationRequired so UI never shows raw scraped junk.
 */
const SCRIPT_PATTERNS = [
  /\(adsbygoogle\s*=\s*window\.adsbygoogle[^)]*\)[^)]*\)?\s*;?/gi,
  /window\.adsbygoogle[^;]*/gi,
  /createElement\s*\(\s*['"]script['"][^)]*\)/gi,
  /\.push\s*\(\s*\{\s*\}\s*\)/g,
  /\[[\s\S]{0,80}\]\.push\s*\(/g,
  /\b(ai|d)\s*=\s*\w+\.createElement/gi,
]

export function sanitizeForDisplay(value, maxLength = 200) {
  if (value == null || typeof value !== 'string') return ''
  let s = value.replace(/\s+/g, ' ').trim()
  for (const re of SCRIPT_PATTERNS) {
    s = s.replace(re, ' ')
  }
  s = s.replace(/\s+/g, ' ').trim()
  if (maxLength > 0 && s.length > maxLength) {
    s = s.slice(0, maxLength - 1).trim() + '…'
  }
  return s
}
