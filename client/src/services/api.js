import axios from 'axios'
import toast from 'react-hot-toast'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${baseURL}`,
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gov_exam_tracker_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.'

    const isAuthRoute = (error?.config?.url || '').includes('/auth/')
    if (!isAuthRoute) toast.error(message)
    return Promise.reject(error)
  }
)

