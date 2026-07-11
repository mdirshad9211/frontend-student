import { calculateAge } from './date'
import { isEducationEligible, isEducationEligibleForKeys } from './education'

function getUserEducations(user) {
  const values = []
  if (user?.education) values.push(user.education)
  if (Array.isArray(user?.educationHistory)) {
    user.educationHistory.forEach((entry) => {
      if (entry?.education) values.push(entry.education)
    })
  }
  return [...new Set(values.filter(Boolean))]
}

export function computeEligibility(user, exam) {
  const age = calculateAge(user?.dob)
  const ageOk = age !== null && age >= exam.minAge && age <= exam.maxAge
  const hasKeys = Array.isArray(exam.educationKeys) && exam.educationKeys.length > 0
  const educations = getUserEducations(user)
  const educationOk = educations.some((edu) =>
    hasKeys ? isEducationEligibleForKeys(edu, exam.educationKeys) : isEducationEligible(edu, exam.educationRequired)
  )
  const missingProfile = !(user?.dob && educations.length > 0)

  return {
    eligible: !missingProfile && ageOk && educationOk,
    reasons: { missingProfile, ageOk, educationOk, userAge: age },
  }
}

