// Transaction history utilities

export interface Transaction {
  hash: string
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'deposit' | 'withdraw' | 'bridge' | 'approve'
  timestamp: number
  tokenIn?: string
  tokenOut?: string
  amountIn?: string
  amountOut?: string
  status: 'success' | 'pending' | 'failed'
}

const STORAGE_KEY = 'xylonet_transactions'

// Helper to save transaction to localStorage
export function saveTransaction(tx: Transaction) {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const transactions: Transaction[] = stored ? JSON.parse(stored) : []
    // Check if already exists
    if (!transactions.find(t => t.hash === tx.hash)) {
      transactions.unshift(tx) // Add to beginning
      // Keep only last 50 transactions
      const trimmed = transactions.slice(0, 50)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    }
  } catch (e) {
    console.error('Failed to save transaction:', e)
  }
}

// Helper to load transactions from localStorage
export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load transactions:', e)
  }
  return []
}

// Helper to clear transaction history
export function clearTransactions() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
