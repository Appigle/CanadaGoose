<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Mail, Settings, User } from 'lucide-vue-next'

const auth = useAuthStore()
const user = auth.user
const isLoading = auth.loading
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="isLoading" class="flex items-center justify-center min-h-64">
      <div class="spinner w-8 h-8"></div>
    </div>

    <div v-else class="space-y-8">
      <!-- Profile Header -->
      <div class="card">
        <div class="card-content p-8">
          <div class="flex items-center space-x-6">
            <div
              class="h-24 w-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center"
            >
              <User class="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user?.username }}</h1>
              <p class="text-gray-600 dark:text-gray-400">{{ user?.email }}</p>
              <div class="mt-4">
                <button class="btn btn-primary py-2 px-4">
                  <Settings class="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
        </div>
        <div class="card-content space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User class="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" :value="user?.username" class="input pl-10" readonly />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail class="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" :value="user?.email" class="input pl-10" readonly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
