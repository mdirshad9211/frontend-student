import { api } from '../../services/api'

export async function getProfile() {
  const { data } = await api.get('/user/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/user/profile', payload)
  return data
}

