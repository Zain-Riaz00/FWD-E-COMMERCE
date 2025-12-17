import React, { createContext, useContext, useMemo, useState } from 'react'
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(product: Product, qty: number = 1) {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product.id === product.id)
      if (i >= 0) {
        const copy = [...prev]
        copy[i] = { ...copy[i], quantity: copy[i].quantity + qty }
        return copy
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  function updateQuantity(productId: string, qty: number) {
    setItems((prev) => prev.map((x) => (x.product.id === productId ? { ...x, quantity: Math.max(0, qty) } : x)).filter((x) => x.quantity > 0))
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((x) => x.product.id !== productId))
  }

  function clear() {
    setItems([])
  }

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
