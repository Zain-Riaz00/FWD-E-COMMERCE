import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { isGuestUser } from '@/utils/guestUser'

interface AdminContextType {
  isAdmin: boolean
  isPermanentAdmin: boolean
  login: () => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPermanentAdmin, setIsPermanentAdmin] = useState(false)

  useEffect(() => {
    // If user is a guest, they should never have admin privileges
    if (isGuestUser()) {
      setIsAdmin(false)
      setIsPermanentAdmin(false)
      localStorage.removeItem('isAdmin')
      return
    }

    // Check if admin session exists AND user data matches
    const adminSession = localStorage.getItem('isAdmin')
    const userStr = localStorage.getItem('user')
    
    if (adminSession === 'true' && userStr) {
      try {
        const user = JSON.parse(userStr)
        // Only set admin if user is actually an admin
        if (user.isAdmin) {
          setIsAdmin(true)
          setIsPermanentAdmin(user.isPermanentAdmin || false)
        } else {
          // User is not admin, clear admin session
          setIsAdmin(false)
          setIsPermanentAdmin(false)
          localStorage.removeItem('isAdmin')
        }
      } catch {
        setIsAdmin(false)
        setIsPermanentAdmin(false)
        localStorage.removeItem('isAdmin')
      }
    } else {
      setIsAdmin(false)
      setIsPermanentAdmin(false)
    }
  }, [])

  const login = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.isAdmin) {
          setIsAdmin(true)
          setIsPermanentAdmin(user.isPermanentAdmin || false)
          localStorage.setItem('isAdmin', 'true')
        }
      } catch {
        // Invalid user data
      }
    }
  }

  const logout = () => {
    setIsAdmin(false)
    setIsPermanentAdmin(false)
    localStorage.removeItem('isAdmin')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isPermanentAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
