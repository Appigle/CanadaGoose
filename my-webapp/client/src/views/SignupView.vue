<script setup lang="ts">
import axios from 'axios'
import { AlertCircle, CheckCircle2, Eye, EyeOff, User } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const successMessage = ref('')

const passwordStrength = computed(() => {
  const p = formData.password
  const score =
    [
      p.length >= 8,
      /[A-Z]/.test(p),
      /[a-z]/.test(p),
      /\d/.test(p),
      /[!@#$%^&*(),.?":{}|<>]/.test(p),
    ].filter(Boolean).length * 20

  let strength = 'Very Weak',
    color = 'text-red-600'
  if (score >= 80) [strength, color] = ['Very Strong', 'text-green-600']
  else if (score >= 60) [strength, color] = ['Strong', 'text-blue-600']
  else if (score >= 40) [strength, color] = ['Medium', 'text-yellow-600']
  else if (score >= 20) [strength, color] = ['Weak', 'text-orange-600']

  return { score, strength, color }
})

const validateForm = () => {
  errors.value = {}

  if (!formData.username) errors.value.username = 'Username is required'
  if (!formData.email) errors.value.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.value.email = 'Invalid email format'

  if (!formData.password) errors.value.password = 'Password is required'
  if (!formData.confirmPassword) errors.value.confirmPassword = 'Confirm Password is required'
  if (
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword
  ) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  successMessage.value = ''

  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })

    localStorage.setItem('authToken', response.data.token)
    successMessage.value = 'Account created successfully! Redirecting...'
    setTimeout(() => router.push('/dashboard'), 1000)
  } catch (error: any) {
    if (error.response?.status === 400) {
      const msg = error.response.data.error
      errors.value.general = msg.includes('User already exists')
        ? 'An account with this email or username already exists.'
        : msg
    } else {
      errors.value.general = 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
          <User class="h-6 w-6 text-primary-600" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <RouterLink to="/login" class="text-primary-600 hover:underline">Sign in here</RouterLink>
        </p>
      </div>

      <!-- Signup Form -->
      <form @submit.prevent="handleSubmit" class="card p-6 space-y-6 animate-fade-in">
        <div v-if="errors.general" class="alert alert-error flex items-center">
          <AlertCircle class="w-5 h-5 mr-2" />
          <span>{{ errors.general }}</span>
        </div>

        <div v-if="successMessage" class="alert alert-success flex items-center">
          <CheckCircle2 class="w-5 h-5 mr-2" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- Username -->
        <div>
          <label for="username">Username</label>
          <input id="username" data-cy="username-input" v-model="formData.username" class="input" />
          <p v-if="errors.username" class="text-red-600 text-sm" data-cy="username-error">
            {{ errors.username }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label for="email">Email</label>
          <input id="email" data-cy="email-input" v-model="formData.email" class="input" />
          <p v-if="errors.email" class="text-red-600 text-sm" data-cy="email-error">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <label for="password">Password</label>
          <div class="relative">
            <input
              id="password"
              data-cy="password-input"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="input pr-10"
            />
            <button
              type="button"
              class="absolute right-2 top-2"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="errors.password" class="text-red-600 text-sm" data-cy="password-error">
            {{ errors.password }}
          </p>
          <div v-if="formData.password" class="mt-2">
            <p class="text-sm flex justify-between">
              <span>Password strength:</span>
              <span :class="passwordStrength.color">{{ passwordStrength.strength }}</span>
            </p>
            <div class="w-full bg-gray-200 h-2 rounded-full">
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

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword">Confirm Password</label>
          <div class="relative">
            <input
              id="confirmPassword"
              data-cy="confirm-password-input"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input pr-10"
            />
            <button
              type="button"
              class="absolute right-2 top-2"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Eye v-if="showConfirmPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p
            v-if="errors.confirmPassword"
            class="text-red-600 text-sm"
            data-cy="confirm-password-error"
          >
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          data-cy="submit-button"
          type="submit"
          class="btn btn-primary w-full h-10 flex justify-center items-center"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loader mr-2"></span>
          {{ isLoading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full border border-gray-300 rounded-md px-3 py-2 text-sm;
}
.alert {
  @apply rounded-md p-3 text-sm;
}
.alert-error {
  @apply bg-red-50 text-red-700 border border-red-200;
}
.alert-success {
  @apply bg-green-50 text-green-700 border border-green-200;
}
.loader {
  @apply animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4;
}
</style>
