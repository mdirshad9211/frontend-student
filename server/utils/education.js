const EDUCATION_LEVELS = [
  '10th',
  '12th',
  'diploma',
  'graduation',
  'post-graduation',
  'phd',
];

function normalizeEducation(value) {
  if (!value) return '';
  return String(value).trim().toLowerCase();
}

function educationRank(value) {
  const normalized = normalizeEducation(value);
  const idx = EDUCATION_LEVELS.findIndex((e) => e === normalized);
  return idx === -1 ? null : idx;
}

function isEducationEligible(userEducation, requiredEducation) {
  const userRank = educationRank(userEducation);
  const reqRank = educationRank(requiredEducation);
  if (reqRank === null) {
    return normalizeEducation(userEducation) === normalizeEducation(requiredEducation);
  }
  if (userRank === null) return false;
  return userRank >= reqRank;
}

module.exports = { EDUCATION_LEVELS, isEducationEligible, normalizeEducation };

