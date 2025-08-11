import { apiURL } from '@/config/api'
import axios from 'axios'
import { defineStore } from 'pinia'

export type User = {
  id: string
  email: string
  username?: string
  // Add more user fields as needed
}

export type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

function saveAuthToStorage(token: string | null, user: User | null) {
  if (token && user) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
}

function loadAuthFromStorage(): { token: string | null; user: User | null } {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')
  let user: User | null = null
  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch {
      user = null
    }
  }
  return { token, user }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const { token, user } = loadAuthFromStorage()
    return {
      user,
      token,
      loading: false,
      error: null,
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${apiURL}/login`, {
          email: credentials.email,
          password: credentials.password,
        })
        this.token = response.data.token
        this.user = response.data.user
        console.log(
          '%c [ response ]-66',
          'font-size:13px; background:pink; color:#bf2c9f;',
          response,
        )
        saveAuthToStorage(this.token, this.user)
      } catch (error: unknown) {
        const e = error as { response?: { data?: { message?: string } }; message?: string }
        this.error = e.response?.data?.message || e.message || 'Login failed'
        this.token = null
        this.user = null
        saveAuthToStorage(null, null)
      } finally {
        this.loading = false
      }
    },
    async signup(data: { username: string; email: string; password: string }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post(`${apiURL}/signup`, {
          username: data.username,
          email: data.email,
          password: data.password,
        })
        this.token = response.data.token
        this.user = response.data.user
        saveAuthToStorage(this.token, this.user)
      } catch (error: unknown) {
        const e = error as {
          response?: { data?: { error?: string; message?: string } }
          message?: string
        }
        this.error =
          e.response?.data?.error || e.response?.data?.message || e.message || 'Signup failed'
        this.token = null
        this.user = null
        saveAuthToStorage(null, null)
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.error = null
      saveAuthToStorage(null, null)
    },
  },
})
