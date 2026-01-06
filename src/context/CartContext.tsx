import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import type { Product } from '@/types/product'

export type CartItem = {
  product: Product
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalQuantity: number
  totalPrice: number
  addItem: (product: Product, qty?: number) => void
  updateQuantity: (productId: string, qty: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

// Get cart key based on user
function getCartKey(): string {
  const userId = localStorage.getItem('userId')
  return userId ? `cart_${userId}` : 'cart_guest'
}

// Load cart from localStorage
function loadCart(): CartItem[] {
  try {
    const key = getCartKey()
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Save cart to localStorage
function saveCart(items: CartItem[]): void {
  try {
    const key = getCartKey()
    localStorage.setItem(key, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save cart:', e)
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('userId'))

  // Listen for user changes (login/logout)
  useEffect(() => {
    const checkUser = () => {
      const userId = localStorage.getItem('userId')
      if (userId !== currentUserId) {
        setCurrentUserId(userId)
        // Load the cart for the new user
        setItems(loadCart())
      }
    }

    // Check on storage events
    window.addEventListener('storage', checkUser)
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkUser, 1000)
    
    return () => {
      window.removeEventListener('storage', checkUser)
      clearInterval(interval)
    }
  }, [currentUserId])

  // Save cart whenever items change
  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((product: Product, qty: number = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product.id === product.id)
      if (i >= 0) {
        const copy = [...prev]
        copy[i] = { ...copy[i], quantity: copy[i].quantity + qty }
        return copy
      }
      return [...prev, { product, quantity: qty }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => prev.map((x) => (x.product.id === productId ? { ...x, quantity: Math.max(0, qty) } : x)).filter((x) => x.quantity > 0))
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.product.id !== productId))
  }, [])

  const clear = useCallback(() => {
    setItems([])
    // Also clear from localStorage
    try {
      const key = getCartKey()
      localStorage.removeItem(key)
    } catch (e) {
      console.error('Failed to clear cart:', e)
    }
  }, [])

  const totals = useMemo(() => {
    const totalQuantity = items.reduce((sum, x) => sum + x.quantity, 0)
    const totalPrice = items.reduce((sum, x) => sum + x.quantity * x.product.price, 0)
    return { totalQuantity, totalPrice }
  }, [items])

  const value: CartContextValue = {
    items,
    totalQuantity: totals.totalQuantity,
    totalPrice: totals.totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
