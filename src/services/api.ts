import type { Product, Category } from '@/types/product'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper to map MongoDB _id to id
const mapProduct = (product: any): Product => ({
  ...product,
  id: product._id || product.id,
  _id: product._id
})

// Helper to map category
const mapCategory = (category: any): Category => ({
  ...category,
  id: category._id || category.id,
  _id: category._id
})

export const productAPI = {
  // Get all products - simple fetch with no timeout
  async getAll(): Promise<Product[]> {
    try {
      console.log('[API] Fetching products...')
      const response = await fetch(`${API_URL}/products`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      console.log(`[API] Got ${data.length} products`)
      return data.map(mapProduct)
    } catch (error) {
      console.error('[API] Error fetching products:', error)
      return []
    }
  },

  // Get single product
  async getById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`)
      if (!response.ok) throw new Error('Failed to fetch product')
      const data = await response.json()
      return mapProduct(data)
    } catch (error) {
      console.error('[API] Error fetching product:', error)
      return null
    }
  },

  // Create product
  async create(productData: Partial<Product>): Promise<Product | null> {
    try {
      console.log('[API] Creating product with data:', productData)
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.details || 'Failed to create')
      }
      const data = await response.json()
      console.log('[API] Product created - response data:', data)
      console.log('[API] parentId in response:', data.parentId)
      console.log('[API] productType in response:', data.productType)
      return mapProduct(data)
    } catch (error) {
      console.error('[API] Error creating product:', error)
      return null
    }
  },

  // Update product
  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      console.log('[API] Updating product:', id)
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error('Failed to update')
      const data = await response.json()
      return mapProduct(data)
    } catch (error) {
      console.error('[API] Error updating product:', error)
      return null
    }
  },

  // Delete product
  async delete(id: string): Promise<boolean> {
    try {
      console.log('[API] Deleting product:', id)
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      })
      return response.ok
    } catch (error) {
      console.error('[API] Error deleting product:', error)
      return false
    }
  },
}

export const categoryAPI = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    try {
      console.log('[API] Fetching categories...')
      const response = await fetch(`${API_URL}/categories`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      console.log(`[API] Got ${data.length} categories`)
      return data.map(mapCategory)
    } catch (error) {
      console.error('[API] Error fetching categories:', error)
      return []
    }
  },

  // Create category
  async create(categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      })
      if (!response.ok) throw new Error('Failed to create category')
      const data = await response.json()
      return mapCategory(data)
    } catch (error) {
      console.error('[API] Error creating category:', error)
      return null
    }
  },

  // Update category
  async update(id: string, categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      })
      if (!response.ok) throw new Error('Failed to update category')
      const data = await response.json()
      return mapCategory(data)
    } catch (error) {
      console.error('[API] Error updating category:', error)
      return null
    }
  },

  // Delete category
  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
      })
      return response.ok
    } catch (error) {
      console.error('[API] Error deleting category:', error)
      return false
    }
  },
}

export const authAPI = {
  // Register user
  async register(userData: { name: string; email: string; password: string }) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to register')
      }
      return await response.json()
    } catch (error) {
      console.error('Error registering user:', error)
      throw error
    }
  },

  // Login user
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to login')
      }
      return await response.json()
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  },
}

// Health check
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`)
    if (!response.ok) throw new Error('Server is not responding')
    return await response.json()
  } catch (error) {
    console.error('Server health check failed:', error)
    return null
  }
}

// Order API
export const orderAPI = {
  // Get all orders
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/orders`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      return data.orders || data || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  // Create order
  async create(orderData: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      if (!response.ok) throw new Error('Failed to create order')
      return await response.json()
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  },

  // Update order status
  async updateStatus(id: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update order')
      return await response.json()
    } catch (error) {
      console.error('Error updating order:', error)
      return null
    }
  }
}

// Logs API - fetches admin activity logs
export const logsAPI = {
  // Get admin logs
  async getAdminLogs(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/admin/logs`)
      if (!response.ok) throw new Error('Failed to fetch admin logs')
      return await response.json()
    } catch (error) {
      console.error('Error fetching admin logs:', error)
      return []
    }
  },

  // Get user logs
  async getUserLogs(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/admin/user-logs`)
      if (!response.ok) throw new Error('Failed to fetch user logs')
      return await response.json()
    } catch (error) {
      console.error('Error fetching user logs:', error)
      return []
    }
  },

  // Log an action
  async logAction(action: { type: string; description: string; userId?: string }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/admin/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (!response.ok) throw new Error('Failed to log action')
      return await response.json()
    } catch (error) {
      console.error('Error logging action:', error)
      return null
    }
  }
}
