// API Configuration for CanadaGoose Client
// This file manages the API base URL for different environments

import axios from 'axios'

// Environment detection
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// API Base URLs
export const API_CONFIG = {
  // Development: localhost for local development
  development: {
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:3000/api',
    frontendURL: 'http://localhost:5173',
  },

  // Production: domain for production deployment
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-domain-here',
    apiURL: import.meta.env.VITE_API_URL || 'https://your-domain-here/api',
    frontendURL: import.meta.env.VITE_FRONTEND_URL || 'https://your-domain-here',
  },
}

// Get current configuration based on environment
export const getCurrentConfig = () => {
  if (isProduction) {
    return API_CONFIG.production
  }
  return API_CONFIG.production
}

// Export current configuration
export const { baseURL, apiURL, frontendURL } = getCurrentConfig()

// Axios instance configuration
export const axiosConfig = {
  baseURL: apiURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// Create axios instance
export const api = axios.create(axiosConfig)

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Environment info for debugging
export const environmentInfo = {
  isDevelopment,
  isProduction,
  currentConfig: getCurrentConfig(),
  timestamp: new Date().toISOString(),
}

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', environmentInfo)
}
