import { api } from '../../services/api'

export async function upsertUserExam(payload) {
  const { data } = await api.post('/user-exams', payload)
  return data
}

export async function listUserExams() {
  const { data } = await api.get('/user-exams')
  return data
}

