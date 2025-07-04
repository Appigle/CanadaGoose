<script setup lang="ts">
import axios from 'axios'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form state
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// UI state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const successMessage = ref('')

// Password strength calculation
const passwordStrength = computed(() => {
  const password = formData.password
  let score = 0
  let requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  score += requirements.length ? 20 : 0
  score += requirements.uppercase ? 20 : 0
  score += requirements.lowercase ? 20 : 0
  score += requirements.number ? 20 : 0
  score += requirements.special ? 20 : 0

  let strength = 'Very Weak'
  let color = 'text-red-600'

  if (score >= 80) {
    strength = 'Very Strong'
    color = 'text-green-600'
  } else if (score >= 60) {
    strength = 'Strong'
    color = 'text-blue-600'
  } else if (score >= 40) {
    strength = 'Medium'
    color = 'text-yellow-600'
  } else if (score >= 20) {
    strength = 'Weak'
    color = 'text-orange-600'
  }

  return { score, strength, color, requirements }
})

// Form submission
const handleSubmit = async () => {
  isLoading.value = true
  errors.value = {}
  successMessage.value = ''

  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })

    // Store the token
    localStorage.setItem('authToken', response.data.token)

    // Show success message
    successMessage.value = 'Account created successfully! Redirecting...'

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error: any) {
    console.error('Signup error:', error)

    if (error.response?.status === 400) {
      const errorMessage = error.response.data.error
      if (errorMessage.includes('User already exists')) {
        errors.value.general = 'An account with this email or username already exists.'
      } else {
        errors.value.general = errorMessage
      }
    } else {
      errors.value.general = 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center"
        >
          <User class="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in here
          </RouterLink>
        </p>
      </div>

      <!-- Signup Form -->
      <div class="card animate-fade-in">
        <form @submit.prevent="handleSubmit" class="space-y-6 p-8">
          <!-- General Error Message -->
          <div
            v-if="errors.general"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
          >
            <div class="flex items-center">
              <AlertCircle class="h-5 w-5 text-red-400 mr-2" />
              <span class="text-sm text-red-700 dark:text-red-400">{{ errors.general }}</span>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4"
          >
            <div class="flex items-center">
              <CheckCircle2 class="h-5 w-5 text-green-400 mr-2" />
              <span class="text-sm text-green-700 dark:text-green-400">{{ successMessage }}</span>
            </div>
          </div>

          <!-- Username Field -->
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                class="input pl-10"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="input pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input pl-10 pr-10"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <!-- Password Strength Indicator -->
            <div v-if="formData.password" class="mt-2 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Password strength:</span>
                <span class="text-sm font-medium" :class="passwordStrength.color">
                  {{ passwordStrength.strength }}
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="{
                    'bg-red-500': passwordStrength.score < 40,
                    'bg-yellow-500': passwordStrength.score >= 40 && passwordStrength.score < 60,
                    'bg-blue-500': passwordStrength.score >= 60 && passwordStrength.score < 80,
                    'bg-green-500': passwordStrength.score >= 80,
                  }"
                  :style="{ width: `${passwordStrength.score}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="input pl-10 pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="showConfirmPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary w-full py-3 text-base font-medium relative"
          >
            <div v-if="isLoading" class="spinner w-5 h-5 mr-2"></div>
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
