<template>
  <div class="relative">
    <!-- Version Button -->
    <button
      @click="toggleTooltip"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      class="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
      :class="buttonClass"
      :aria-label="`${versionInfo.name} version information`"
    >
      <Info class="h-3 w-3" />
      <span class="font-mono font-medium">v{{ versionInfo.version }}</span>
    </button>

    <!-- Version Tooltip -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showTooltip"
        class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg z-50 whitespace-nowrap min-w-48"
      >
        <!-- Version Header -->
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="font-semibold">{{ versionInfo.name }} v{{ versionInfo.version }}</span>
        </div>

        <!-- Tech Stack -->
        <div class="text-gray-300 dark:text-gray-600 mb-1">
          {{ versionInfo.tech }}
        </div>

        <!-- Build Date -->
        <div class="text-gray-300 dark:text-gray-600 text-xs">
          Built: {{ formatBuildDate(versionInfo.buildDate) }}
        </div>

        <!-- Environment Badge -->
        <div class="mt-2 pt-2 border-t border-gray-700 dark:border-gray-300">
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="environmentBadgeClass"
          >
            {{ environment }}
          </span>
        </div>

        <!-- Tooltip Arrow -->
        <div
          class="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { versionInfo } from '@/config/version'
import { Info } from 'lucide-vue-next'
import { computed, ref } from 'vue'

// Props
interface Props {
  size?: 'sm' | 'md' | 'lg'
  showEnvironment?: boolean
  buttonClass?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  showEnvironment: true,
  buttonClass: '',
})

// State
const showTooltip = ref(false)

// Computed
const environment = computed(() => {
  if (import.meta.env.DEV) return 'Development'
  if (import.meta.env.PROD) return 'Production'
  return 'Unknown'
})

const environmentBadgeClass = computed(() => {
  if (import.meta.env.DEV) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
  if (import.meta.env.PROD) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
})

// Methods
const toggleTooltip = () => {
  showTooltip.value = !showTooltip.value
}

const formatBuildDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Unknown'
  }
}
</script>

<style scoped>
/* Custom animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
