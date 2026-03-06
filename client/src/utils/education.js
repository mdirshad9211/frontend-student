const LEVELS = ['10th', '12th', 'diploma', 'graduation', 'post-graduation', 'phd']

function normalize(value) {
  if (!value) return ''
  return String(value).trim().toLowerCase()
}

function rank(value) {
  const idx = LEVELS.findIndex((x) => x === normalize(value))
  return idx === -1 ? null : idx
}

export function isEducationEligible(userEducation, requiredEducation) {
  const u = rank(userEducation)
  const r = rank(requiredEducation)
  if (r === null) return normalize(userEducation) === normalize(requiredEducation)
  if (u === null) return false
  return u >= r
}

export const EDUCATION_OPTIONS = LEVELS

