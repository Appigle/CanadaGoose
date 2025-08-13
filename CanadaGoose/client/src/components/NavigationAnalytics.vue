<template>
  <div
    class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Navigation Monitor</h3>
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="isMonitoring ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ isMonitoring ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Current Path:</span>
        <span class="font-mono text-gray-900 dark:text-white">{{ currentPath }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Navigation Count:</span>
        <span class="font-mono text-gray-900 dark:text-white">{{ navigationCount }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Last Navigation:</span>
        <span class="font-mono text-gray-900 dark:text-white">{{ lastNavigation }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Session Duration:</span>
        <span class="font-mono text-gray-900 dark:text-white">{{ sessionDuration }}</span>
      </div>
    </div>

    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="toggleMonitoring"
        class="w-full px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
      >
        {{ isMonitoring ? 'Pause' : 'Resume' }} Monitoring
      </button>
    </div>

    <!-- Recent Navigation History -->
    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-xs font-medium text-gray-900 dark:text-white mb-2">Recent Navigation</h4>
      <div class="space-y-1 max-h-32 overflow-y-auto">
        <div
          v-for="(nav, index) in recentNavigation"
          :key="index"
          class="text-xs text-gray-600 dark:text-gray-400"
        >
          <span class="font-mono">{{ nav.from }}</span>
          <span class="mx-1">→</span>
          <span class="font-mono">{{ nav.to }}</span>
          <span class="text-gray-400 ml-2">{{ nav.duration }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationEvent } from '@/services/navigationMonitor'
import { navigationMonitor } from '@/services/navigationMonitor'
import { onMounted, onUnmounted, ref } from 'vue'

// Reactive state
const isMonitoring = ref(true)
const currentPath = ref('/')
const navigationCount = ref(0)
const lastNavigation = ref('N/A')
const sessionDuration = ref('0s')
const recentNavigation = ref<NavigationEvent[]>([])
const sessionStartTime = ref(Date.now())

// Update session duration
const updateSessionDuration = () => {
  const duration = Math.floor((Date.now() - sessionStartTime.value) / 1000)
  sessionDuration.value = `${duration}s`
}

// Update current path
const updateCurrentPath = () => {
  currentPath.value = navigationMonitor.getCurrentPath()
}

// Handle navigation events (called when navigation occurs)
const handleNavigation = (event: NavigationEvent) => {
  navigationCount.value++
  lastNavigation.value = new Date().toLocaleTimeString()

  // Add to recent navigation (keep only last 10)
  recentNavigation.value.unshift(event)
  if (recentNavigation.value.length > 10) {
    recentNavigation.value = recentNavigation.value.slice(0, 10)
  }

  updateCurrentPath()
}

// Listen for navigation events from the monitor
onMounted(() => {
  // This would be connected to the navigation monitor events
  // For now, we'll simulate with a timer
  const timer = setInterval(() => {
    // Simulate navigation events for demo
    if (Math.random() > 0.8) {
      const mockEvent: NavigationEvent = {
        from: currentPath.value,
        to: currentPath.value,
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 1000),
        userAgent: navigator.userAgent,
        component: 'NavigationAnalytics',
      }
      handleNavigation(mockEvent)
    }
  }, 5000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})

// Toggle monitoring
const toggleMonitoring = () => {
  isMonitoring.value = !isMonitoring.value
  if (isMonitoring.value) {
    // Resume monitoring
    console.log('🔄 Navigation monitoring resumed')
  } else {
    // Pause monitoring
    console.log('⏸️ Navigation monitoring paused')
  }
}

// Lifecycle
onMounted(() => {
  updateCurrentPath()
  updateSessionDuration()

  // Update session duration every second
  const interval = setInterval(updateSessionDuration, 1000)

  // Cleanup
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
/* Custom scrollbar for recent navigation */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
