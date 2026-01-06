import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, MapPin, CheckCircle, Clock, XCircle, RefreshCw, Home, Box } from 'lucide-react'
import { orderAPI } from '@/services/api'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
}

interface StatusHistory {
  status: string
  timestamp: string
  note?: string
}

interface Order {
  _id: string
  orderNumber?: string
  items: OrderItem[]
  totalAmount: number
  status: string
  statusHistory: StatusHistory[]
  shippingAddress: {
    fullName: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  trackingNumber?: string
  createdAt: string
  estimatedDelivery?: string
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Box },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: Home }
]

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

export default function OrderTrackingPage() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('Order ID not provided')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const result = await orderAPI.track(orderId)
      if (result) {
        setOrder(result)
        setError('')
      } else {
        setError('Order not found')
      }
    } catch {
      setError('Failed to load order details')
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const getCurrentStatusIndex = () => {
    if (!order) return -1
    if (order.status === 'cancelled') return -1
    return statusSteps.findIndex(step => step.key === order.status)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cyan-100">Loading order details...</h2>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-2">Order Not Found</h1>
          <p className="text-cyan-300/70 mb-6">{error || 'Unable to find this order.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const currentStatusIndex = getCurrentStatusIndex()
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a]">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
            onClick={fetchOrder}
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
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Track Your Order
              </span>
            </h1>
            <p className="text-cyan-200/70">Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Status Banner */}
          <div className={`mb-8 p-6 rounded-2xl border ${getStatusColor(order.status)} backdrop-blur-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70 mb-1">Current Status</p>
                <p className="text-2xl font-bold capitalize">
                  {order.status.replace('_', ' ')}
                </p>
              </div>
              {order.trackingNumber && (
                <div className="text-right">
                  <p className="text-sm opacity-70 mb-1">Tracking Number</p>
                  <p className="font-mono font-bold">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          {!isCancelled && (
            <div className="mb-8 p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-cyan-100 mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-400" />
                Delivery Progress
              </h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-cyan-900/50" />
                <div
                  className="absolute left-5 top-0 w-0.5 bg-gradient-to-b from-green-400 to-cyan-400 transition-all duration-500"
                  style={{ height: `${Math.max(0, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%` }}
                />

                {/* Steps */}
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    const StepIcon = step.icon

                    return (
                      <div key={step.key} className="flex items-center gap-4 relative">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-cyan-500 border-green-400'
                              : 'bg-[#0a0e1a] border-cyan-400/30'
                          } ${isCurrent ? 'ring-4 ring-cyan-500/30' : ''}`}
                        >
                          <StepIcon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-cyan-400/50'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isCompleted ? 'text-cyan-100' : 'text-cyan-400/50'}`}>
                            {step.label}
                          </p>
                          {isCurrent && order.statusHistory.length > 0 && (
                            <p className="text-sm text-cyan-300/70">
                              {new Date(order.statusHistory[order.statusHistory.length - 1].timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Notice */}
          {isCancelled && (
            <div className="mb-8 p-6 rounded-2xl border border-red-400/30 bg-red-500/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <XCircle className="h-10 w-10 text-red-400" />
                <div>
                  <h3 className="text-xl font-bold text-red-400">Order Cancelled</h3>
                  <p className="text-red-300/70">This order has been cancelled.</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-8 p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-cyan-50">{item.name}</h3>
                    <p className="text-cyan-300/70">Qty: {item.quantity}</p>
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-cyan-400/10 flex justify-between items-center">
              <span className="text-cyan-200/70">Total</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8 p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-cyan-200">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory.length > 0 && (
            <div className="mb-8 p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                Status History
              </h2>
              <div className="space-y-3">
                {order.statusHistory.slice().reverse().map((history, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                    <div>
                      <p className="font-semibold text-cyan-100 capitalize">
                        {history.status.replace('_', ' ')}
                      </p>
                      <p className="text-cyan-300/70">
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                      {history.note && (
                        <p className="text-cyan-200/80 mt-1">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
            >
              Continue Shopping
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/contact')}
              className="flex-1 px-8 py-4 rounded-xl border-2 border-cyan-400 bg-cyan-500/10 text-cyan-100 font-bold hover:bg-cyan-500/20 transition-all"
            >
              Need Help?
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
