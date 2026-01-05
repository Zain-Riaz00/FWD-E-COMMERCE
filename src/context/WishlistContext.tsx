import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Product } from '@/types/product'

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_STORAGE_KEY = 'wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToWishlist = (product: Product) => {
    setItems(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev // Already in wishlist
      }
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalItems: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
