<script setup lang="ts">
import { CheckCircle, Lock, Shield, Users, Zap } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 sm:py-32">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <div class="mb-8">
            <div
              class="mx-auto h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center"
            >
              <Shield class="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Secure Authentication
            <span class="text-primary-600 dark:text-primary-400">Made Simple</span>
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Experience enterprise-grade security with a beautiful, modern interface. Built with Vue
            3, TypeScript, and cutting-edge security practices.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <RouterLink to="/signup" class="btn btn-primary px-8 py-3 text-base">
              Get Started
            </RouterLink>
            <RouterLink to="/login" class="btn btn-ghost px-8 py-3 text-base"> Sign In </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Built for Security
          </h2>
          <p class="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Modern authentication features that keep your data safe while providing an excellent
            user experience.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <!-- Feature 1 -->
            <div class="flex flex-col">
              <div
                class="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
              >
                <Lock class="h-6 w-6 text-white" />
              </div>
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Enterprise Security
              </dt>
              <dd
                class="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400"
              >
                <p class="flex-auto">
                  Advanced password policies, account locking, and rate limiting protect against
                  brute force attacks.
                </p>
              </dd>
            </div>

            <!-- Feature 2 -->
            <div class="flex flex-col">
              <div
                class="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
              >
                <Users class="h-6 w-6 text-white" />
              </div>
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                User Experience
              </dt>
              <dd
                class="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400"
              >
                <p class="flex-auto">
                  Beautiful dark/light themes, real-time validation, and intuitive interface design.
                </p>
              </dd>
            </div>

            <!-- Feature 3 -->
            <div class="flex flex-col">
              <div
                class="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
              >
                <Zap class="h-6 w-6 text-white" />
              </div>
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Modern Stack
              </dt>
              <dd
                class="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400"
              >
                <p class="flex-auto">
                  Built with Vue 3, TypeScript, Tailwind CSS, and Express.js for optimal
                  performance.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Security Features -->
    <section class="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Security Features
          </h2>
          <p class="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Comprehensive security measures protect your account and data.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl
            class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
          >
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div
                  class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
                >
                  <CheckCircle class="h-6 w-6 text-white" />
                </div>
                Password Strength Validation
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Real-time password strength checking with visual feedback and security requirements.
              </dd>
            </div>
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div
                  class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
                >
                  <Shield class="h-6 w-6 text-white" />
                </div>
                Account Protection
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Automatic account locking after multiple failed login attempts with time-based
                recovery.
              </dd>
            </div>
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div
                  class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
                >
                  <Lock class="h-6 w-6 text-white" />
                </div>
                JWT Authentication
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Secure token-based authentication with automatic expiration and refresh
                capabilities.
              </dd>
            </div>
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div
                  class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600"
                >
                  <Zap class="h-6 w-6 text-white" />
                </div>
                Rate Limiting
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Advanced rate limiting prevents brute force attacks and protects server resources.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p class="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Join thousands of users who trust our secure authentication platform.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <RouterLink to="/signup" class="btn btn-primary px-8 py-3 text-base">
              Create Account
            </RouterLink>
            <RouterLink to="/about" class="btn btn-ghost px-8 py-3 text-base">
              Learn More
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
