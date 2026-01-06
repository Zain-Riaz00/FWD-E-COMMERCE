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
  // Get all orders (optionally filter by user)
  async getAll(userId?: string, userEmail?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userEmail) params.append('userEmail', userEmail)
      
      const url = params.toString() ? `${API_URL}/orders?${params}` : `${API_URL}/orders`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      return data.orders || data || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  // Get user's orders
  async getMyOrders(): Promise<any[]> {
    // Get user from localStorage (stored as JSON object under 'user' key)
    const userJson = localStorage.getItem('user')
    let userId = localStorage.getItem('userId')
    let userEmail = localStorage.getItem('userEmail')
    
    // Parse the user object if it exists
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        userId = user._id || userId
        userEmail = user.email || userEmail
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    return this.getAll(userId || undefined, userEmail || undefined)
  },

  // Get single order
  async getById(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`)
      if (!response.ok) throw new Error('Failed to fetch order')
      return await response.json()
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  },

  // Track order by order number
  async track(orderNumber: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/orders/track/${orderNumber}`)
      if (!response.ok) throw new Error('Order not found')
      return await response.json()
    } catch (error) {
      console.error('Error tracking order:', error)
      return null
    }
  },

  // Create order
  async create(orderData: any): Promise<any> {
    try {
      console.log('[orderAPI] Creating order at:', `${API_URL}/orders`)
      console.log('[orderAPI] Order data:', orderData)
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      console.log('[orderAPI] Response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[orderAPI] Error response:', errorText)
        throw new Error(`Failed to create order: ${response.status}`)
      }
      const result = await response.json()
      console.log('[orderAPI] Order created:', result)
      return result
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  },

  // Update order status (admin)
  async updateStatus(id: string, status: string, note?: string, trackingNumber?: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, trackingNumber }),
      })
      if (!response.ok) throw new Error('Failed to update order')
      return await response.json()
    } catch (error) {
      console.error('Error updating order:', error)
      return null
    }
  }
}

// Notification API
export const notificationAPI = {
  // Get notifications
  async getAll(userId?: string, isAdmin?: boolean): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (isAdmin) params.append('isAdmin', 'true')
      
      const response = await fetch(`${API_URL}/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return await response.json()
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  // Create notification
  async create(data: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create notification')
      return await response.json()
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  },

  // Mark as read
  async markAsRead(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      return await response.json()
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return null
    }
  },

  // Mark all as read
  async markAllAsRead(userId?: string, isAdmin?: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin }),
      })
      return response.ok
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }
}

// Feedback API
export const feedbackAPI = {
  // Get all feedback (admin)
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/feedback`)
      if (!response.ok) throw new Error('Failed to fetch feedback')
      return await response.json()
    } catch (error) {
      console.error('Error fetching feedback:', error)
      return []
    }
  },

  // Submit feedback (user)
  async submit(data: { userName: string; userEmail: string; type?: string; subject?: string; message: string; userId?: string }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to submit feedback')
      return await response.json()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      return null
    }
  },

  // Reply to feedback (admin)
  async reply(id: string, reply: string, status?: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/feedback/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply, status }),
      })
      if (!response.ok) throw new Error('Failed to reply to feedback')
      return await response.json()
    } catch (error) {
      console.error('Error replying to feedback:', error)
      return null
    }
  }
}

// Discount API
export const discountAPI = {
  // Get all discounts (admin)
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/discounts`)
      if (!response.ok) throw new Error('Failed to fetch discounts')
      return await response.json()
    } catch (error) {
      console.error('Error fetching discounts:', error)
      return []
    }
  },

  // Create discount (admin)
  async create(data: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create discount')
      return await response.json()
    } catch (error) {
      console.error('Error creating discount:', error)
      return null
    }
  },

  // Validate discount code
  async validate(code: string, orderTotal: number): Promise<{ valid: boolean; discount?: any; discountAmount?: number; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/discounts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal }),
      })
      return await response.json()
    } catch (error) {
      console.error('Error validating discount:', error)
      return { valid: false, error: 'Failed to validate discount' }
    }
  },

  // Delete discount (admin)
  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/discounts/${id}`, {
        method: 'DELETE',
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting discount:', error)
      return false
    }
  }
}

// Review API
export const reviewAPI = {
  // Get all reviews
  async getAll(productId?: string, status?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (productId) params.append('productId', productId)
      if (status) params.append('status', status)
      
      const response = await fetch(`${API_URL}/reviews?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      return await response.json()
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
  },

  // Submit review (user)
  async submit(data: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to submit review')
      return await response.json()
    } catch (error) {
      console.error('Error submitting review:', error)
      return null
    }
  },

  // Update review status (admin)
  async updateStatus(id: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update review')
      return await response.json()
    } catch (error) {
      console.error('Error updating review:', error)
      return null
    }
  },

  // Reply to review (admin)
  async reply(id: string, replyText: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/reviews/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      })
      if (!response.ok) throw new Error('Failed to reply to review')
      return await response.json()
    } catch (error) {
      console.error('Error replying to review:', error)
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

  // Log admin action
  async logAdminAction(action: { action: string; description?: string; adminId?: string; adminEmail?: string; targetType?: string; targetId?: string }): Promise<any> {
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
  },

  // Log user action
  async logUserAction(action: { action: string; description?: string; userId?: string; userEmail?: string }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/admin/user-logs`, {
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
