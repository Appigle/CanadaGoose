<script setup lang="ts">
import { versionInfo } from '@/config/version'
import { useAuthStore } from '@/stores/auth'
import { useDark, useToggle } from '@vueuse/core'
import { LogOut, Moon, Sun } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

// Theme management
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Navigation state
const router = useRouter()
const auth = useAuthStore()
const { isAuthenticated, user } = storeToRefs(auth)

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const navigateToProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <div
    id="app"
    class="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300 text-gray-800 dark:text-gray-100"
  >
    <!-- Header -->
    <header
      class="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <img src="/logo.png" alt="CanadaGoose" class="h-8 w-8" />
          <div class="flex flex-col">
            <span class="text-xl font-bold tracking-tight">CanadaGoose</span>
          </div>
        </div>

        <nav class="hidden md:flex space-x-6 text-sm">
          <RouterLink to="/" class="hover:text-primary-600 dark:hover:text-primary-400"
            >Home</RouterLink
          >
          <RouterLink
            to="/financial"
            v-if="isAuthenticated"
            class="hover:text-primary-600 dark:hover:text-primary-400"
            >Financial</RouterLink
          >
          <RouterLink
            to="/dashboard"
            v-if="isAuthenticated"
            class="hover:text-primary-600 dark:hover:text-primary-400"
            >Dashboard</RouterLink
          >
        </nav>

        <div class="flex items-center space-x-4">
          <button
            @click="toggleDark()"
            class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            <Sun v-if="isDark" class="h-5 w-5 text-yellow-500" />
            <Moon v-else class="h-5 w-5 text-gray-600" />
          </button>
          <template v-if="isAuthenticated">
            <button @click="navigateToProfile" class="text-sm hover:underline">
              {{ user?.username }}
            </button>
            <button
              @click="handleLogout"
              class="text-sm text-red-600 hover:underline flex items-center"
            >
              <LogOut class="h-4 w-4 mr-2" />
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-sm hover:underline">Login</RouterLink>
            <RouterLink
              to="/signup"
              class="btn btn-primary px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >Sign Up</RouterLink
            >
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer
      class="mt-auto py-6 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md"
    >
      <div
        class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400"
      >
        <div class="mb-4 md:mb-0 flex items-center space-x-2">
          <span>© 2025 CanadaGoose. All rights reserved.</span>
          <span class="text-xs text-gray-400 dark:text-gray-500">•</span>
          <span class="text-xs font-mono text-gray-500 dark:text-gray-400"
            >v{{ versionInfo.version }}</span
          >
        </div>
        <div class="flex space-x-4">
          <a href="#" class="hover:underline">Privacy Policy</a>
          <a href="#" class="hover:underline">Terms of Service</a>
          <a href="#" class="hover:underline">Support</a>
        </div>
      </div>
    </footer>

    <!-- Navigation Analytics Component -->
    <!-- <NavigationAnalytics /> -->
  </div>
</template>

<style scoped>
/* Add custom styles if needed */
.router-link-active {
  @apply text-primary-600 dark:text-primary-400 font-semibold;
}

.router-link-exact-active {
  @apply text-primary-600 dark:text-primary-400 font-semibold;
}

/* Custom primary theme colors if not defined in tailwind.config.js */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow transition-all duration-300;
}

.gradient-bg {
  background: linear-gradient(to bottom right, #e0f2fe, #ffffff);
}

@media (prefers-color-scheme: dark) {
  .gradient-bg {
    background: linear-gradient(to bottom right, #1e293b, #0f172a);
  }
}

/* Version display animations */
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
