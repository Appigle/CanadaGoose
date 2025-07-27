<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-vue-next'
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

// Form state
const formData = reactive({
  email: '',
  password: '',
})

// UI state
const showPassword = ref(false)
const errors = ref<Record<string, string>>({})
const successMessage = ref('')

// Validation rules
const validateForm = () => {
  errors.value = {}

  if (!formData.email) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!formData.password) {
    errors.value.password = 'Password is required'
  } else if (formData.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }

  return Object.keys(errors.value).length === 0
}

// Watch for login success
watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    console.log('%c [ isAuth ]-44', 'font-size:13px; background:pink; color:#bf2c9f;', isAuth)
    if (isAuth) {
      successMessage.value = 'Login successful! Redirecting...'
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
  },
)

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  errors.value = {}
  successMessage.value = ''

  await auth.login({
    email: formData.email,
    password: formData.password,
  })

  if (auth.error) {
    if (auth.error.includes('429')) {
      errors.value.general = 'Too many login attempts. Please try again later.'
    } else if (auth.error.includes('423')) {
      errors.value.general = 'Account temporarily locked due to multiple failed attempts.'
    } else if (auth.error.includes('401') || auth.error.includes('Invalid')) {
      errors.value.general = 'Invalid email or password.'
    } else {
      errors.value.general = auth.error
    }
  }
}

const clearFieldError = (field: string) => {
  if (errors.value[field]) {
    delete errors.value[field]
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
          <Lock class="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <RouterLink
            to="/signup"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign up here
          </RouterLink>
        </p>
      </div>

      <!-- Login Form -->
      <div class="card animate-fade-in">
        <form @submit.prevent="handleSubmit" class="space-y-6 p-8" data-cy="login-form">
          <!-- General Error -->
          <div
            v-if="errors.general"
            data-cy="general-error"
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
            data-cy="success-message"
            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4"
          >
            <div class="flex items-center">
              <CheckCircle2 class="h-5 w-5 text-green-400 mr-2" />
              <span class="text-sm text-green-700 dark:text-green-400">{{ successMessage }}</span>
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
                data-cy="email-input"
                v-model="formData.email"
                @input="clearFieldError('email')"
                type="email"
                autocomplete="email"
                class="input pl-10"
                :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
                placeholder="Enter your email"
              />
            </div>
            <p
              v-if="errors.email"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
              data-cy="email-error"
            >
              {{ errors.email }}
            </p>
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
                data-cy="password-input"
                v-model="formData.password"
                @input="clearFieldError('password')"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="input pl-10 pr-10"
                :class="{ 'border-red-500 focus:ring-red-500': errors.password }"
                placeholder="Enter your password"
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
            <p
              v-if="errors.password"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
              data-cy="password-error"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="auth.loading"
            data-cy="submit-button"
            class="btn btn-primary w-full py-3 text-base font-medium relative"
          >
            <div v-if="auth.loading" class="spinner w-5 h-5 mr-2"></div>
            {{ auth.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
