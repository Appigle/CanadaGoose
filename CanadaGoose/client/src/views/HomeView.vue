<script setup lang="ts"></script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
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
              See a Demo
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
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
