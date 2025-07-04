<script setup lang="ts">
import { ArrowLeft, Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <!-- 404 Illustration -->
      <div class="space-y-4">
        <div class="text-9xl font-bold text-primary-600 dark:text-primary-400">404</div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
        <p class="text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goHome"
          class="btn btn-primary inline-flex items-center justify-center px-6 py-3"
        >
          <Home class="h-5 w-5 mr-2" />
          Go Home
        </button>
        <button
          @click="goBack"
          class="btn btn-secondary inline-flex items-center justify-center px-6 py-3"
        >
          <ArrowLeft class="h-5 w-5 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
