<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { LogOut, Moon, Shield, Sun, User } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

// Theme management
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Navigation state
const router = useRouter()
const isAuthenticated = ref(false) // This will be managed by Pinia store later

// Mock user data (will be replaced with Pinia store)
const user = ref({ username: '', email: '' })

// Check authentication status on mount
onMounted(() => {
  // Check for stored auth token
  const token = localStorage.getItem('authToken')
  isAuthenticated.value = !!token
})

const handleLogout = () => {
  localStorage.removeItem('authToken')
  isAuthenticated.value = false
  router.push('/login')
}

const navigateToProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <div id="app" class="min-h-screen gradient-bg transition-colors duration-300">
    <!-- Header Navigation -->
    <header
      class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center space-x-3">
            <Shield class="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">SecureAuth</h1>
          </div>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center space-x-8">
            <RouterLink
              to="/"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </RouterLink>
            <RouterLink
              v-if="!isAuthenticated"
              to="/login"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </RouterLink>
            <RouterLink
              v-if="!isAuthenticated"
              to="/signup"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Up
            </RouterLink>
            <RouterLink
              v-if="isAuthenticated"
              to="/dashboard"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </RouterLink>
          </nav>

          <!-- User Menu & Theme Toggle -->
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button
              @click="toggleDark()"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              <Sun v-if="isDark" class="h-5 w-5 text-yellow-500" />
              <Moon v-else class="h-5 w-5 text-gray-600" />
            </button>

            <!-- User Menu (when authenticated) -->
            <div v-if="isAuthenticated" class="flex items-center space-x-3">
              <button
                @click="navigateToProfile"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User class="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span class="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                  Profile
                </span>
              </button>
              <button
                @click="handleLogout"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut class="h-5 w-5" />
                <span class="hidden sm:block text-sm">Logout</span>
              </button>
            </div>

            <!-- Auth Buttons (when not authenticated) -->
            <div v-else class="flex items-center space-x-3">
              <RouterLink to="/login" class="btn btn-ghost px-4 py-2"> Login </RouterLink>
              <RouterLink to="/signup" class="btn btn-primary px-4 py-2"> Sign Up </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer
      class="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 mt-auto"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield class="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              SecureAuth © 2025 - Enterprise Security Solution
            </span>
          </div>
          <div class="flex items-center space-x-6">
            <a
              href="#"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
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
</style>
