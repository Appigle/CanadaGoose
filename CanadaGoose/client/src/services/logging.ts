import axios from 'axios'

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  component?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
  metadata?: Record<string, unknown>
}

// Frontend logging service
class Logger {
  private sessionId: string
  private userId?: string
  private apiUrl: string
  private isProduction: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.apiUrl = import.meta.env.VITE_API_URL || '/api'
    this.isProduction = import.meta.env.PROD

    // Debug environment variables
    console.log('🔍 Logging Service Environment:', {
      VITE_ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      PROD: import.meta.env.PROD,
      isProduction: this.isProduction,
    })

    // Set user ID from localStorage if available
    this.userId = localStorage.getItem('userId') || undefined

    // Listen for auth state changes
    this.setupAuthListener()
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private setupAuthListener(): void {
    // Listen for storage changes to update userId
    window.addEventListener('storage', (e) => {
      if (e.key === 'userId') {
        this.userId = e.newValue || undefined
      }
    })
  }

  private async sendToBackend(logEntry: LogEntry): Promise<void> {
    try {
      // Only send to backend in production or when explicitly enabled
      const enableLogging = import.meta.env.VITE_ENABLE_LOGGING === 'true'
      if (!this.isProduction && !enableLogging) {
        return
      }

      await axios.post(`${this.apiUrl}/logs`, logEntry, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      // Fallback to console if backend logging fails
      console.error('Failed to send log to backend:', error)
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      component: this.getCurrentComponent(),
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata,
    }
  }

  private getCurrentComponent(): string {
    // Try to get current Vue component name
    try {
      // This is a simple approach - in a real app you might want to use Vue's devtools or context
      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Public logging methods
  debug(message: string, metadata?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry(LogLevel.DEBUG, message, metadata)
    console.debug(message, metadata)
    this.sendToBackend(logEntry)
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry(LogLevel.INFO, message, metadata)
    console.info(message, metadata)
    this.sendToBackend(logEntry)
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry(LogLevel.WARN, message, metadata)
    console.warn(message, metadata)
    this.sendToBackend(logEntry)
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry(LogLevel.ERROR, message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
    console.error(message, error, metadata)
    this.sendToBackend(logEntry)
  }

  // Specialized logging methods
  logUserAction(action: string, details?: Record<string, unknown>): void {
    this.info(`User Action: ${action}`, {
      action,
      ...details,
    })
  }

  logNavigation(from: string, to: string): void {
    this.info('Navigation', {
      from,
      to,
      type: 'navigation',
    })
  }

  logAPIError(endpoint: string, error: any, requestData?: any): void {
    this.error(
      `API Error: ${endpoint}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        endpoint,
        requestData,
        type: 'api_error',
      },
    )
  }

  logPerformance(operation: string, duration: number, details?: Record<string, any>): void {
    this.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      type: 'performance',
      ...details,
    })
  }

  logSecurity(event: string, details?: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, {
      event,
      type: 'security',
      ...details,
    })
  }

  // Set user ID (call this after login)
  setUserId(userId: string): void {
    this.userId = userId
    localStorage.setItem('userId', userId)
  }

  // Clear user ID (call this after logout)
  clearUserId(): void {
    this.userId = undefined
    localStorage.removeItem('userId')
  }
}

// Create and export singleton instance
export const logger = new Logger()

// Vue plugin for easy access in components
export const LoggingPlugin = {
  install(app: any) {
    app.config.globalProperties.$logger = logger

    // Add to provide/inject
    app.provide('logger', logger)
  },
}

// Composable for composition API
export function useLogger() {
  return logger
}

export default logger
