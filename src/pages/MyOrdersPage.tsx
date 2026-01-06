import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, Clock, CheckCircle, MapPin, RefreshCw, ShoppingBag, ChevronRight, XCircle } from 'lucide-react'
import { orderAPI } from '@/services/api'

interface OrderItem {
  productId: string
  productName?: string
  name?: string
  quantity: number
  price: number
  imageUrl?: string
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  totalAmount: number
  status: string
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30'
    case 'confirmed':
      return 'text-blue-400 bg-blue-500/20 border-blue-400/30'
    case 'processing':
      return 'text-purple-400 bg-purple-500/20 border-purple-400/30'
    case 'shipped':
      return 'text-cyan-400 bg-cyan-500/20 border-cyan-400/30'
    case 'out_for_delivery':
      return 'text-orange-400 bg-orange-500/20 border-orange-400/30'
    case 'delivered':
      return 'text-green-400 bg-green-500/20 border-green-400/30'
    case 'cancelled':
      return 'text-red-400 bg-red-500/20 border-red-400/30'
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-400/30'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock
    case 'confirmed':
    case 'delivered':
      return CheckCircle
    case 'processing':
      return Package
    case 'shipped':
    case 'out_for_delivery':
      return Truck
    case 'cancelled':
      return XCircle
    default:
      return Package
  }
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
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
    
    if (!userId && !userEmail) {
      setError('Please login to view your orders')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      // Fetch user's orders using the API method
      const userOrders = await orderAPI.getMyOrders()
      setOrders(userOrders)
      setError('')
    } catch {
      setError('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOrderClick = (orderId: string) => {
    navigate(`/order-tracking/${orderId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cyan-100">Loading your orders...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a]">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-4">
              <ShoppingBag className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                My Orders
              </span>
            </h1>
            <p className="text-cyan-200/70">Track and manage your orders</p>
          </div>

          {error ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold"
              >
                Login to View Orders
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-cyan-100 mb-2">No orders yet</h2>
              <p className="text-cyan-300/70 mb-6">Start shopping to see your orders here!</p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)
                const firstItem = order.items[0]
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
                
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleOrderClick(order._id)}
                    className="p-4 sm:p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl cursor-pointer hover:border-cyan-400/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      {firstItem?.imageUrl ? (
                        <img
                          src={firstItem.imageUrl}
                          alt={firstItem.productName || firstItem.name}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-cyan-400/50" />
                        </div>
                      )}
                      
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm text-cyan-300/70">Order #{order.orderNumber}</p>
                            <h3 className="font-bold text-cyan-100 truncate">
                              {firstItem?.productName || firstItem?.name || 'Unknown Product'}
                              {itemCount > 1 && ` (+${itemCount - 1} more)`}
                            </h3>
                          </div>
                          <ChevronRight className="h-5 w-5 text-cyan-400/50 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="capitalize">{order.status.replace('_', ' ')}</span>
                          </span>
                          
                          <span className="text-cyan-200/70">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        
                        {order.trackingNumber && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-cyan-300/70">
                            <MapPin className="w-4 h-4" />
                            <span>Tracking: {order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
