import { api } from '../../services/api'

export async function adminListExams() {
  const { data } = await api.get('/admin/exams')
  return data
}

export async function adminCreateExam(payload) {
  const { data } = await api.post('/admin/exam', payload)
  return data
}

export async function adminUpdateExam(id, payload) {
  const { data } = await api.put(`/admin/exam/${id}`, payload)
  return data
}

export async function adminDeleteExam(id) {
  const { data } = await api.delete(`/admin/exam/${id}`)
  return data
}

export async function adminListExamCycles() {
  const { data } = await api.get('/admin/exam-cycles')
  return data
}

export async function adminCreateExamCycle(payload) {
  const { data } = await api.post('/admin/exam-cycle', payload)
  return data
}

export async function adminListUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function adminRunSarkariScraper(limit = 40) {
  const { data } = await api.post('/admin/scrape/sarkariresult', { limit })
  return data
}

