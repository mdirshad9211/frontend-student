/**
 * Use only for apply/official links. We never redirect to SarkariResult.
 */
export function isOfficialUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const host = new URL(url, 'https://example.com').hostname.toLowerCase()
    return !host.includes('sarkariresult.com')
  } catch {
    return false
  }
}
