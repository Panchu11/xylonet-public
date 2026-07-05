'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'pending' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  txHash?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-remove after duration (default 5s, pending toasts don't auto-remove)
    if (toast.type !== 'pending') {
      const duration = toast.duration ?? 5000
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
    
    // If updating to a non-pending type, auto-remove after duration
    if (updates.type && updates.type !== 'pending') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, updates.duration ?? 5000)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    pending: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400" />,
  }

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    pending: 'bg-blue-500/10 border-blue-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl animate-in slide-in-from-right-full',
        bgColors[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-400 mt-1">{toast.message}</p>
        )}
        {toast.txHash && (
          <a
            href={`https://testnet.arcscan.app/tx/${toast.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
          >
            View on Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}

// Helper hooks for common toast patterns
export function useTxToast() {
  const { addToast, updateToast, removeToast } = useToast()

  const pending = useCallback((title: string, message?: string) => {
    return addToast({ type: 'pending', title, message })
  }, [addToast])

  const success = useCallback((id: string, title: string, txHash?: string) => {
    updateToast(id, { type: 'success', title, txHash })
  }, [updateToast])

  const error = useCallback((id: string | null, title: string, message?: string) => {
    if (id) {
      updateToast(id, { type: 'error', title, message })
    } else {
      addToast({ type: 'error', title, message })
    }
  }, [addToast, updateToast])

  return { pending, success, error, removeToast }
}
