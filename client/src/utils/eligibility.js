import { calculateAge } from './date'
import { isEducationEligible, isEducationEligibleForKeys } from './education'

export function computeEligibility(user, exam) {
  const age = calculateAge(user?.dob)
  const ageOk = age !== null && age >= exam.minAge && age <= exam.maxAge
  const hasKeys = Array.isArray(exam.educationKeys) && exam.educationKeys.length > 0
  const educationOk =
    Boolean(user?.education) &&
    (hasKeys
      ? isEducationEligibleForKeys(user.education, exam.educationKeys)
      : isEducationEligible(user.education, exam.educationRequired))
  const missingProfile = !(user?.dob && user?.education)

  return {
    eligible: !missingProfile && ageOk && educationOk,
    reasons: { missingProfile, ageOk, educationOk, userAge: age },
  }
}

