import { useLogger } from './logging'

export interface NavigationEvent {
  from: string
  to: string
  timestamp: string
  duration?: number
  userAgent: string
  referrer?: string
  component?: string
}

class NavigationMonitor {
  private logger = useLogger()
  private currentPath: string
  private navigationStartTime: number
  private isInitialized = false

  constructor() {
    this.currentPath = window.location.pathname
    this.navigationStartTime = Date.now()
    this.setupMonitoring()
  }

  private setupMonitoring() {
    if (this.isInitialized) return
    this.isInitialized = true

    // Monitor popstate (browser back/forward)
    window.addEventListener('popstate', this.handleNavigation.bind(this))

    // Monitor hash changes
    window.addEventListener('hashchange', this.handleNavigation.bind(this))

    // Monitor pushstate/replacestate (programmatic navigation)
    this.interceptHistoryMethods()

    // Log initial page load
    this.logPageLoad()
  }

  private interceptHistoryMethods() {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      this.handleNavigation()
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      this.handleNavigation()
    }
  }

  private handleNavigation() {
    const newPath = window.location.pathname
    const oldPath = this.currentPath

    if (oldPath !== newPath) {
      const duration = Date.now() - this.navigationStartTime

      this.logNavigation(oldPath, newPath, duration)

      this.currentPath = newPath
      this.navigationStartTime = Date.now()
    }
  }

  private logPageLoad() {
    const navigationEvent: NavigationEvent = {
      from: 'external',
      to: this.currentPath,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      component: 'NavigationMonitor',
    }

    this.logger.info('Page Load', {
      type: 'page_load',
      ...navigationEvent,
    })
  }

  private logNavigation(from: string, to: string, duration: number) {
    const navigationEvent: NavigationEvent = {
      from,
      to,
      timestamp: new Date().toISOString(),
      duration,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      component: 'NavigationMonitor',
    }

    // Log navigation with performance data
    this.logger.info('Navigation', {
      type: 'navigation',
      ...navigationEvent,
    })

    // Log performance metric for navigation
    this.logger.logPerformance('navigation', duration, {
      from,
      to,
      type: 'route_change',
    })
  }

  // Public method to manually log navigation (useful for programmatic navigation)
  public logManualNavigation(from: string, to: string, metadata?: Record<string, unknown>) {
    const navigationEvent: NavigationEvent = {
      from,
      to,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      component: 'NavigationMonitor',
      ...metadata,
    }

    this.logger.info('Manual Navigation', {
      type: 'manual_navigation',
      ...navigationEvent,
    })
  }

  // Get current path
  public getCurrentPath(): string {
    return this.currentPath
  }

  // Get navigation duration
  public getNavigationDuration(): number {
    return Date.now() - this.navigationStartTime
  }
}

// Create singleton instance
export const navigationMonitor = new NavigationMonitor()

// Export for use in components
export default navigationMonitor
