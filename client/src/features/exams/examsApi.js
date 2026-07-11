import { api } from '../../services/api'

export async function listExams(params = {}) {
  const { data } = await api.get('/exams', { params })
  return data
}

export async function getExam(id) {
  const { data } = await api.get(`/exams/${id}`)
  return data
}

export async function getEligible() {
  const { data } = await api.get('/exams/eligible')
  return data
}

