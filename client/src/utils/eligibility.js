import { calculateAge } from './date'
import { isEducationEligible } from './education'

export function computeEligibility(user, exam) {
  const age = calculateAge(user?.dob)
  const ageOk = age !== null && age >= exam.minAge && age <= exam.maxAge
  const educationOk = Boolean(user?.education) && isEducationEligible(user.education, exam.educationRequired)
  const missingProfile = !(user?.dob && user?.education)

  return {
    eligible: !missingProfile && ageOk && educationOk,
    reasons: { missingProfile, ageOk, educationOk, userAge: age },
  }
}

