import axios from 'axios'
import { signOut } from 'next-auth/react'

const instance = axios.create()

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      signOut({ callbackUrl: '/login' })
    }
    return Promise.reject(error)
  }
)

export { instance as api }
