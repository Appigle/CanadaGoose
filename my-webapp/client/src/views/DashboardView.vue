<script setup lang="ts">
import axios from 'axios'
import { User } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const user = ref<any>(null)
const isLoading = ref(true)

const loadUserData = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    user.value = response.data.user
  } catch (error) {
    console.error('Failed to load user data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="isLoading" class="flex items-center justify-center min-h-64">
      <div class="spinner w-8 h-8"></div>
    </div>

    <div v-else class="space-y-8">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-lg p-8">
        <div class="flex items-center space-x-4">
          <div class="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
            <User class="h-8 w-8" />
          </div>
          <div>
            <h1 class="text-3xl font-bold">Welcome back, {{ user?.username || 'User' }}!</h1>
            <p class="text-primary-100 mt-1">Here's what's happening with your account today.</p>
          </div>
        </div>
      </div>

      <!-- Account Information -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Your account details</p>
        </div>
        <div class="card-content space-y-4">
          <div class="flex items-center justify-between py-3">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Username:</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ user?.username }}</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <span class="text-sm font-medium text-gray-900 dark:text-white">Email:</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ user?.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
