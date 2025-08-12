<script setup lang="ts">
import { apiURL } from '@/config/api'
import { AlertCircle, CheckCircle, Sparkles, TrendingUp, Wallet, XCircle } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

// Health check state
const healthStatus = ref<'loading' | 'healthy' | 'unhealthy' | 'error'>('loading')
const healthMessage = ref('')
const lastChecked = ref<Date | null>(null)

// Health check function
const checkHealth = async () => {
  try {
    healthStatus.value = 'loading'
    healthMessage.value = 'Checking API status...'

    const response = await fetch(`${apiURL}/healthcheck`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      healthStatus.value = 'healthy'
      healthMessage.value = data.message || 'API is healthy and responding'
    } else {
      healthStatus.value = 'unhealthy'
      healthMessage.value = `API responded with status: ${response.status}`
    }
  } catch (error) {
    healthStatus.value = 'error'
    healthMessage.value = 'Unable to connect to API'
    console.error('Health check error:', error)
  } finally {
    lastChecked.value = new Date()
  }
}

// Auto-refresh health status every 30 seconds
const startHealthMonitoring = () => {
  checkHealth()
  setInterval(checkHealth, 30000)
}

// Get status icon and colors
const getStatusDisplay = () => {
  switch (healthStatus.value) {
    case 'healthy':
      return {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
      }
    case 'unhealthy':
      return {
        icon: AlertCircle,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
      }
    case 'error':
      return {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
      }
    default:
      return {
        icon: AlertCircle,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
      }
  }
}

onMounted(() => {
  startHealthMonitoring()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Health Status Banner -->
    <div class="border-b border-gray-200 dark:border-gray-700" :class="getStatusDisplay().bgColor">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <component
              :is="getStatusDisplay().icon"
              class="h-5 w-5"
              :class="getStatusDisplay().color"
            />
            <span class="text-sm font-medium" :class="getStatusDisplay().color">
              {{ healthMessage }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Last checked: {{ lastChecked ? lastChecked.toLocaleTimeString() : 'Never' }}
            </span>
            <button
              @click="checkHealth"
              class="text-xs px-3 py-1 rounded-md border transition-colors"
              :class="[getStatusDisplay().borderColor, 'hover:bg-white dark:hover:bg-gray-800']"
              :disabled="healthStatus === 'loading'"
            >
              {{ healthStatus === 'loading' ? 'Checking...' : 'Refresh' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div class="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1">
          <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Take Control of Your Finances with <span class="text-primary-600">CanadaGoose</span>
          </h2>
          <p class="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Track expenses, log income, and get smart financial insights powered by AI — all in one
            sleek, modern dashboard.
          </p>
          <div class="mt-8 flex space-x-4">
            <RouterLink
              to="/signup"
              class="btn btn-primary px-6 py-3 rounded-lg text-white text-lg bg-primary-600 hover:bg-primary-700"
            >
              Get Started Free
            </RouterLink>
            <RouterLink
              to="/demo"
              class="text-lg px-6 py-3 underline hover:text-primary-600 dark:hover:text-primary-400"
            >
              Let's Go!
            </RouterLink>
          </div>
        </div>
        <div class="flex-1">
          <!-- Replace with actual screenshot/animation -->
          <img
            src="/dashboard.png"
            alt="CanadaGoose Dashboard Preview"
            class="rounded-2xl shadow-xl w-full"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
      <div class="max-w-6xl mx-auto px-4">
        <h3 class="text-3xl font-bold text-center mb-12">Why Choose CanadaGoose?</h3>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <TrendingUp class="mx-auto h-12 w-12 mb-4 text-primary-600 dark:text-primary-400" />
            <h4 class="text-xl font-semibold">Smart Expense Tracking</h4>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              Categorize your daily spending with ease and gain insights on where your money goes.
            </p>
          </div>
          <div class="text-center">
            <Wallet class="mx-auto h-12 w-12 mb-4 text-primary-600 dark:text-primary-400" />
            <h4 class="text-xl font-semibold">Track Your Income</h4>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              Log salary, freelance work, or side hustle income — all in one place.
            </p>
          </div>
          <div class="text-center">
            <Sparkles class="mx-auto h-12 w-12 mb-4 text-primary-600 dark:text-primary-400" />
            <h4 class="text-xl font-semibold">AI-Powered Insights</h4>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              Let our AI analyze your habits and recommend smarter budgeting strategies.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Version Showcase Section -->
    <section
      class="py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
    >
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold mb-8">App Information</h3>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div class="flex flex-col items-center space-y-4">
            <div
              class="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center"
            >
              <Sparkles class="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h4 class="text-xl font-semibold">CanadaGoose</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">Smart Personal Finance Tracker</p>
            <VersionDisplay />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
