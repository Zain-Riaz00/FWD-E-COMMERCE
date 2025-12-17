import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface AdminContextType {
  isAdmin: boolean
  login: () => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if admin session exists
    const adminSession = localStorage.getItem('isAdmin')
    if (adminSession === 'true') {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [])

  const login = () => {
    setIsAdmin(true)
    localStorage.setItem('isAdmin', 'true')
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
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
