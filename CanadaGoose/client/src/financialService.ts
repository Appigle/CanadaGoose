<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header Section -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Track your income and expenses with detailed analytics
            </p>
          </div>
          <button
            @click="showAddTransaction = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Income
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(summary.totalIncome, summary.primaryCurrency) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Expenses
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(summary.totalExpenses, summary.primaryCurrency) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Net Balance
                  </dt>
                  <dd
                    class="text-lg font-medium text-gray-900 dark:text-white"
                    :class="
                      summary.netBalance >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ formatCurrency(summary.netBalance, summary.primaryCurrency) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                v-model="filters.type"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expenditure">Expenditure</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                v-model="filters.startDate"
                max="2024-12-31"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                v-model="filters.endDate"
                max="2024-12-31"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex items-end">
              <button
                @click="applyFilters"
                class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="px-6 py-12 text-center">
          <div
            class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-gray-900 dark:text-white"
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading transactions...
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="transactions.length === 0" class="px-6 py-12 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first financial transaction.
          </p>
          <div class="mt-6">
            <button
              @click="showAddTransaction = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Transaction
            </button>
          </div>
        </div>

        <!-- Transactions Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Transaction
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="transaction in transactions"
                :key="transaction.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div
                        class="h-10 w-10 rounded-full flex items-center justify-center"
                        :class="
                          transaction.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        "
                      >
                        <svg
                          v-if="transaction.type === 'income'"
                          class="h-6 w-6 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <svg
                          v-else
                          class="h-6 w-6 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ transaction.description || 'No description' }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ transaction.type === 'income' ? 'Income' : 'Expense' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    :class="
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ transaction.type === 'income' ? '+' : '-'
                    }}{{ formatCurrency(transaction.amount, transaction.currency) }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ transaction.currency }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(transaction.transaction_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {{ transaction.subtype }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editTransaction(transaction)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteTransaction(transaction.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.total > pagination.limit"
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing {{ pagination.offset + 1 }} to
              {{ Math.min(pagination.offset + pagination.limit, pagination.total) }} of
              {{ pagination.total }} results
            </div>
            <div class="flex space-x-2">
              <button
                @click="previousPage"
                :disabled="pagination.offset === 0"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="nextPage"
                :disabled="!pagination.hasMore"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Transaction Modal -->
    <div v-if="showAddTransaction" class="fixed inset-0 z-50 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="closeModal"
        ></div>

        <div
          class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ editingTransaction ? 'Edit Transaction' : 'Add New Transaction' }}
            </h3>
          </div>

          <form @submit.prevent="submitTransaction" class="px-6 py-4">
            <div class="space-y-4">
              <!-- Transaction Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type *
                </label>
                <select
                  v-model="transactionForm.type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Type</option>
                  <option value="income">Income</option>
                  <option value="expenditure">Expenditure</option>
                </select>
              </div>

              <!-- Subtype -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  v-model="transactionForm.subtype"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Category</option>
                  <option v-if="transactionForm.type === 'income'" value="salary">Salary</option>
                  <option v-if="transactionForm.type === 'income'" value="bonus">Bonus</option>
                  <option v-if="transactionForm.type === 'income'" value="investment">
                    Investment
                  </option>
                  <option v-if="transactionForm.type === 'income'" value="freelance">
                    Freelance
                  </option>
                  <option v-if="transactionForm.type === 'income'" value="other">Other</option>
                  <option v-if="transactionForm.type === 'expenditure'" value="grocery">
                    Grocery
                  </option>
                  <option v-if="transactionForm.type === 'expenditure'" value="transportation">
                    Transportation
                  </option>
                  <option v-if="transactionForm.type === 'expenditure'" value="gift">Gift</option>
                  <option v-if="transactionForm.type === 'expenditure'" value="entertainment">
                    Entertainment
                  </option>
                  <option v-if="transactionForm.type === 'expenditure'" value="utilities">
                    Utilities
                  </option>
                  <option v-if="transactionForm.type === 'expenditure'" value="rent">Rent</option>
                  <option v-if="transactionForm.type === 'expenditure'" value="other">Other</option>
                </select>
              </div>

              <!-- Amount and Currency -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    v-model="transactionForm.amount"
                    step="0.01"
                    min="0.01"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency *
                  </label>
                  <select
                    v-model="transactionForm.currency"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              <!-- Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Date *
                </label>
                <input
                  type="date"
                  v-model="transactionForm.transaction_date"
                  :max="maxDate"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  v-model="transactionForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Optional description of the transaction"
                ></textarea>
              </div>
            </div>

            <!-- Error Messages -->
            <div
              v-if="formErrors.length > 0"
              class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
            >
              <div class="text-sm text-red-600 dark:text-red-400">
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="error in formErrors" :key="error">{{ error }}</li>
                </ul>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="submitting" class="inline-flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ editingTransaction ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>{{ editingTransaction ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success/Error Toast -->
    <div v-if="toast.show" class="fixed bottom-4 right-4 z-50">
      <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              v-if="toast.type === 'success'"
              class="h-6 w-6 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="h-6 w-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ toast.title }}
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ toast.message }}
            </p>
          </div>
          <div class="ml-auto pl-3">
            <button
              @click="toast.show = false"
              class="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { api } from '../config/api'

// Types
interface FinancialTransaction {
  id: number
  user_id: number
  type: 'income' | 'expenditure'
  subtype: string
  amount: number
  currency: 'USD' | 'CAD'
  transaction_date: string
  description?: string
  created_at: string
  updated_at: string
}

interface TransactionForm {
  type: string
  subtype: string
  amount: string
  currency: string
  transaction_date: string
  description: string
}

interface Summary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  primaryCurrency: string
}

interface Pagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface Filters {
  type: string
  startDate: string
  endDate: string
}

interface Toast {
  show: boolean
  type: 'success' | 'error'
  title: string
  message: string
}

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const showAddTransaction = ref(false)
const editingTransaction = ref<FinancialTransaction | null>(null)
const transactions = ref<FinancialTransaction[]>([])
const summary = ref<Summary>({
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
  primaryCurrency: 'USD',
})

const pagination = ref<Pagination>({
  total: 0,
  limit: 50,
  offset: 0,
  hasMore: false,
})

const filters = reactive<Filters>({
  type: '',
  startDate: '',
  endDate: '',
})

const transactionForm = reactive<TransactionForm>({
  type: '',
  subtype: '',
  amount: '',
  currency: 'USD',
  transaction_date: '',
  description: '',
})

const formErrors = ref<string[]>([])
const toast = ref<Toast>({
  show: false,
  type: 'success',
  title: '',
  message: '',
})

// Computed properties
const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Methods
const loadTransactions = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.startDate) params.append('start_date', filters.startDate)
    if (filters.endDate) params.append('end_date', filters.endDate)
    params.append('limit', pagination.value.limit.toString())
    params.append('offset', pagination.value.offset.toString())

    const response = await api.get(`/financial/transactions?${params}`)
    transactions.value = response.data.transactions
    pagination.value = response.data.pagination
  } catch (error) {
    console.error('Error loading transactions:', error)
    showToast('error', 'Error', 'Failed to load transactions')
  } finally {
    loading.value = false
  }
}

const loadSummary = async () => {
  try {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('start_date', filters.startDate)
    if (filters.endDate) params.append('end_date', filters.endDate)

    const response = await api.get(`/financial/summary?${params}`)
    const summaryData = response.data.summary

    // Calculate totals
    let totalIncome = 0
    let totalExpenses = 0
    let primaryCurrency = 'USD'

    summaryData.forEach((item: { type: string; total_amount: string; currency: string }) => {
      if (item.type === 'income') {
        totalIncome += parseFloat(item.total_amount)
      } else {
        totalExpenses += parseFloat(item.total_amount)
      }
      // Use the first currency as primary
      if (!primaryCurrency) primaryCurrency = item.currency
    })

    summary.value = {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      primaryCurrency,
    }
  } catch (error) {
    console.error('Error loading summary:', error)
  }
}

const applyFilters = () => {
  pagination.value.offset = 0
  loadTransactions()
  loadSummary()
}

const previousPage = () => {
  if (pagination.value.offset > 0) {
    pagination.value.offset -= pagination.value.limit
    loadTransactions()
  }
}

const nextPage = () => {
  if (pagination.value.hasMore) {
    pagination.value.offset += pagination.value.limit
    loadTransactions()
  }
}

const resetForm = () => {
  Object.assign(transactionForm, {
    type: '',
    subtype: '',
    amount: '',
    currency: 'USD',
    transaction_date: '',
    description: '',
  })
  formErrors.value = []
  editingTransaction.value = null
}

const editTransaction = (transaction: FinancialTransaction) => {
  editingTransaction.value = transaction
  Object.assign(transactionForm, {
    type: transaction.type,
    subtype: transaction.subtype,
    amount: transaction.amount.toString(),
    currency: transaction.currency,
    transaction_date: transaction.transaction_date,
    description: transaction.description || '',
  })
  showAddTransaction.value = true
}

const closeModal = () => {
  showAddTransaction.value = false
  resetForm()
}

const validateForm = () => {
  formErrors.value = []

  if (!transactionForm.type) {
    formErrors.value.push('Transaction type is required')
  }

  if (!transactionForm.subtype) {
    formErrors.value.push('Category is required')
  }

  if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
    formErrors.value.push('Amount must be a positive number')
  }

  if (!transactionForm.currency) {
    formErrors.value.push('Currency is required')
  }

  if (!transactionForm.transaction_date) {
    formErrors.value.push('Transaction date is required')
  }

  // Validate date is not in future
  const inputDate = new Date(transactionForm.transaction_date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (inputDate > today) {
    formErrors.value.push('Transaction date cannot be in the future')
  }

  return formErrors.value.length === 0
}

const submitTransaction = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    if (editingTransaction.value) {
      // Update existing transaction
      await api.put(`/financial/transactions/${editingTransaction.value.id}`, transactionForm)
      showToast('success', 'Success', 'Transaction updated successfully')
    } else {
      // Create new transaction
      await api.post('/financial/submit', transactionForm)
      showToast('success', 'Success', 'Transaction created successfully')
    }

    closeModal()
    loadTransactions()
    loadSummary()
  } catch (error: unknown) {
    console.error('Error submitting transaction:', error)
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Failed to submit transaction'
    showToast('error', 'Error', message)
  } finally {
    submitting.value = false
  }
}

const deleteTransaction = async (id: number) => {
  if (!confirm('Are you sure you want to delete this transaction?')) return

  try {
    await api.delete(`/financial/transactions/${id}`)
    showToast('success', 'Success', 'Transaction deleted successfully')
    loadTransactions()
    loadSummary()
  } catch (error: unknown) {
    console.error('Error deleting transaction:', error)
    showToast('error', 'Error', 'Failed to delete transaction')
  }
}

const showToast = (type: 'success' | 'error', title: string, message: string) => {
  toast.value = { show: true, type, title, message }
  setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Watchers
watch(
  () => transactionForm.type,
  () => {
    // Reset subtype when type changes
    transactionForm.subtype = ''
  },
)

// Lifecycle
onMounted(() => {
  loadTransactions()
  loadSummary()
})
</script>
