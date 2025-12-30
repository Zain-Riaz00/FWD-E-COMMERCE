import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, MapPin, Calendar } from 'lucide-react'
import { safeSetItem } from '@/utils/storageUtils'
import type { Product } from '@/types/product'

interface OrderState {
  product: Product
  quantity: number
  address: {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as OrderState | undefined

  // Generate order number on mount
  const [orderNumber] = useState(() => `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`)
  
  const estimatedDelivery = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 5)
    return date
  }, [])

  useEffect(() => {
    if (!state?.product) {
      navigate('/')
      return
    }

    try {
      // Send notification
      const notification = {
        id: Date.now().toString(),
        type: 'order' as const,
        title: 'Order Confirmed! 🎉',
        message: `Your order #${orderNumber} for ${state.product.name} has been confirmed and will be delivered soon.`,
        time: new Date().toISOString(),
        read: false,
        imageUrl: state.product.imageUrl,
      }

      // Add to notifications with limit of 50 to prevent quota issues
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      notifications.unshift(notification)
      
      // Keep only last 50 notifications
      const limitedNotifications = notifications.slice(0, 50)
      
      // Use safe set to prevent quota errors
      safeSetItem('notifications', JSON.stringify(limitedNotifications))

      // Trigger custom event for notification update - use correct event name
      window.dispatchEvent(new CustomEvent('global-notifications-update'))
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'notifications',
        newValue: JSON.stringify(limitedNotifications),
      }))
    } catch (error) {
      console.error('Failed to save notification:', error)
      // Continue anyway - don't block the user
    }
  }, [state, navigate, orderNumber])

  if (!state?.product) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-100 mb-4">No Order Found</h1>
          <p className="text-cyan-300/70 mb-6">Please place an order first.</p>
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

  const { product, quantity, address } = state
  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a]">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                Order Confirmed!
              </span>
            </h1>
            <p className="text-cyan-200/70">Thank you for your purchase. Your order has been placed successfully.</p>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Number */}
            <div className="p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300/70 text-sm mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-cyan-100">{orderNumber}</p>
                </div>
                <Package className="h-8 w-8 text-cyan-400" />
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" />
                Order Items
              </h2>
              <div className="flex gap-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-cyan-50 mb-1">{product.name}</h3>
                  <p className="text-cyan-200/70 text-sm mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">Qty: {quantity}</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                Delivery Address
              </h2>
              <div className="space-y-2 text-cyan-200">
                <p className="font-semibold">{address.fullName}</p>
                <p>{address.phone}</p>
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-400" />
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-100">Order Confirmed</p>
                    <p className="text-sm text-cyan-300/70">Your order has been placed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500">
                    <Package className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-100">Processing</p>
                    <p className="text-sm text-cyan-300/70">We're preparing your order</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500">
                    <Truck className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-100">On the Way</p>
                    <p className="text-sm text-cyan-300/70">Your order is being shipped</p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Estimated Delivery: <span className="font-bold">{estimatedDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                onClick={() => navigate('/notifications')}
                className="flex-1 px-8 py-4 rounded-xl border-2 border-cyan-400 bg-cyan-500/10 text-cyan-100 font-bold hover:bg-cyan-500/20 transition-all"
              >
                View Notifications
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
