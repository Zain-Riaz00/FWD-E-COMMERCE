import type { Product } from '@/types/product'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper to map MongoDB _id to id
const mapProduct = (product: any): Product => ({
  ...product,
  id: product._id || product.id,
  _id: product._id
})

// Fetch with timeout helper
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export const productAPI = {
  // Get all products
  async getAll(): Promise<Product[]> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/products`, {}, 15000)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      return data.map(mapProduct)
    } catch (error) {
      console.error('Error fetching products:', error)
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
      console.error('Error fetching product:', error)
      return null
    }
  },

  // Create product
  async create(productData: Partial<Product>): Promise<Product | null> {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error('Failed to create product')
      const data = await response.json()
      return mapProduct(data)
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  },

  // Update product
  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error('Failed to update product')
      const data = await response.json()
      return mapProduct(data)
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  },

  // Delete product
  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete product')
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
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
