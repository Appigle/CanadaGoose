// API Configuration for CanadaGoose Client
// This file manages the API base URL for different environments

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
    baseURL: 'http://s25cicd.xiaopotato.top',
    apiURL: 'http://s25cicd.xiaopotato.top/api',
    frontendURL: 'http://s25cicd.xiaopotato.top',
  },
}

// Get current configuration based on environment
export const getCurrentConfig = () => {
  if (isProduction) {
    return API_CONFIG.production
  }
  return API_CONFIG.development
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
