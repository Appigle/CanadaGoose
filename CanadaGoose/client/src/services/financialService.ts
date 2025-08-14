import { api } from '../config/api'

export interface FinancialTransaction {
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

export interface CreateTransactionData {
  type: 'income' | 'expenditure'
  subtype: string
  amount: number
  currency: 'USD' | 'CAD'
  transaction_date: string
  description?: string
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: number
}

export interface TransactionFilters {
  type?: 'income' | 'expenditure'
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface TransactionResponse {
  transactions: FinancialTransaction[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface SummaryItem {
  type: 'income' | 'expenditure'
  total_amount: number
  currency: 'USD' | 'CAD'
  transaction_count: number
}

export interface TopCategory {
  type: 'income' | 'expenditure'
  subtype: string
  total_amount: number
  currency: 'USD' | 'CAD'
  transaction_count: number
}

export interface FinancialSummary {
  summary: SummaryItem[]
  topCategories: TopCategory[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
    status?: number
  }
  message?: string
}

class FinancialService {
  /**
   * Submit a new financial transaction
   */
  async submitTransaction(
    data: CreateTransactionData,
  ): Promise<ApiResponse<{ transaction: FinancialTransaction }>> {
    try {
      const response = await api.post('/financial/submit', data)
      return response.data
    } catch (error: unknown) {
      this.handleApiError(error as ApiError, 'Failed to submit transaction')
      throw error
    }
  }

  /**
   * Get user's financial transactions with optional filtering
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionResponse> {
    try {
      const params = new URLSearchParams()

      if (filters.type) params.append('type', filters.type)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const response = await api.get(`/financial/transactions?${params}`)
      return response.data
    } catch (error: unknown) {
      this.handleApiError(error as ApiError, 'Failed to fetch transactions')
      throw error
    }
  }

  /**
   * Get financial summary and statistics
   */
  async getSummary(
    filters: { start_date?: string; end_date?: string } = {},
  ): Promise<FinancialSummary> {
    try {
      const params = new URLSearchParams()

      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await api.get(`/financial/summary?${params}`)
      return response.data
    } catch (error: unknown) {
      this.handleApiError(error as ApiError, 'Failed to fetch financial summary')
      throw error
    }
  }

  /**
   * Update an existing transaction
   */
  async updateTransaction(
    id: number,
    data: Partial<CreateTransactionData>,
  ): Promise<ApiResponse<{ transaction: FinancialTransaction }>> {
    try {
      const response = await api.put(`/financial/transactions/${id}`, data)
      return response.data
    } catch (error: unknown) {
      this.handleApiError(error as ApiError, 'Failed to update transaction')
      throw error
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: number): Promise<void> {
    try {
      await api.delete(`/financial/transactions/${id}`)
    } catch (error: unknown) {
      this.handleApiError(error as ApiError, 'Failed to delete transaction')
      throw error
    }
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(id: number): Promise<FinancialTransaction> {
    try {
      const response = await api.get(`/financial/transactions/${id}`)
      return response.data.transaction
    } catch (error: unknown) {
      this.handleApiError(error as ApiError, 'Failed to fetch transaction')
      throw error
    }
  }

  /**
   * Validate transaction data before submission
   */
  validateTransactionData(data: CreateTransactionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!data.type) errors.push('Transaction type is required')
    if (!data.subtype) errors.push('Category is required')
    if (!data.amount) errors.push('Amount is required')
    if (!data.currency) errors.push('Currency is required')
    if (!data.transaction_date) errors.push('Transaction date is required')

    // Type validation
    if (data.type && !['income', 'expenditure'].includes(data.type)) {
      errors.push('Invalid transaction type')
    }

    // Subtype validation
    if (data.type && data.subtype) {
      const validSubtypes = {
        income: ['salary', 'bonus', 'investment', 'freelance', 'other'],
        expenditure: [
          'grocery',
          'transportation',
          'gift',
          'entertainment',
          'utilities',
          'rent',
          'other',
        ],
      }

      if (!validSubtypes[data.type].includes(data.subtype)) {
        errors.push(`Invalid category for ${data.type}`)
      }
    }

    // Amount validation
    if (data.amount && (isNaN(data.amount) || data.amount <= 0)) {
      errors.push('Amount must be a positive number')
    }

    // Currency validation
    if (data.currency && !['USD', 'CAD'].includes(data.currency)) {
      errors.push('Invalid currency')
    }

    // Date validation
    if (data.transaction_date) {
      const inputDate = new Date(data.transaction_date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      if (isNaN(inputDate.getTime())) {
        errors.push('Invalid date format')
      } else if (inputDate > today) {
        errors.push('Transaction date cannot be in the future')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Calculate summary statistics from transactions
   */
  calculateSummary(transactions: FinancialTransaction[]): {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    primaryCurrency: string
  } {
    let totalIncome = 0
    let totalExpenses = 0
    let primaryCurrency = 'USD'

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount
      } else {
        totalExpenses += transaction.amount
      }

      // Use the first currency as primary
      if (!primaryCurrency) primaryCurrency = transaction.currency
    })

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      primaryCurrency,
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: ApiError, defaultMessage: string): void {
    console.error('Financial API Error:', {
      message: error.response?.data?.message || error.message || defaultMessage,
      status: error.response?.status,
      data: error.response?.data,
      error,
    })
  }

  /**
   * Get available subtypes for a transaction type
   */
  getAvailableSubtypes(type: 'income' | 'expenditure'): string[] {
    const subtypes = {
      income: ['salary', 'bonus', 'investment', 'freelance', 'other'],
      expenditure: [
        'grocery',
        'transportation',
        'gift',
        'entertainment',
        'utilities',
        'rent',
        'other',
      ],
    }
    return subtypes[type] || []
  }

  /**
   * Get available currencies
   */
  getAvailableCurrencies(): string[] {
    return ['USD', 'CAD']
  }

  /**
   * Get available transaction types
   */
  getAvailableTypes(): string[] {
    return ['income', 'expenditure']
  }
}

export const financialService = new FinancialService()
export default financialService
