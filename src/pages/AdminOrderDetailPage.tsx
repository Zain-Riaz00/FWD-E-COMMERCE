import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, MapPin, CheckCircle, Clock, XCircle, User, Phone, Home, Send } from 'lucide-react'
import { orderAPI, notificationAPI } from '@/services/api'
import { useAdmin } from '@/contexts/AdminContext'
import Snackbar from '@/components/ui/Snackbar'

interface OrderItem {
  productId: string
  productName: string
  name?: string
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
  userId?: string
  orderNumber?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: OrderItem[]
  totalAmount: number
  status: string
  statusHistory: StatusHistory[]
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  trackingNumber?: string
  createdAt: string
  estimatedDelivery?: string
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-400' },
  { value: 'processing', label: 'Processing', color: 'text-purple-400' },
  { value: 'shipped', label: 'Shipped', color: 'text-cyan-400' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'text-orange-400' },
  { value: 'delivered', label: 'Delivered', color: 'text-green-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' }
]

export default function AdminOrderDetailPage() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { isAdmin } = useAdmin()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [snackbar, setSnackbar] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, isAdmin, navigate])

  const fetchOrder = async () => {
    if (!orderId) return
    
    try {
      setIsLoading(true)
      const result = await orderAPI.track(orderId)
      if (result) {
        setOrder(result)
        setSelectedStatus(result.status)
        setTrackingNumber(result.trackingNumber || '')
        setError('')
      } else {
        setError('Order not found')
      }
    } catch {
      setError('Failed to load order details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !selectedStatus) return
    
    setIsUpdating(true)
    try {
      const updated = await orderAPI.updateStatus(
        order._id,
        selectedStatus,
        statusNote || `Order status updated to ${selectedStatus}`,
        trackingNumber
      )
      
      if (updated) {
        // Send notification to customer
        const statusLabel = statusOptions.find(s => s.value === selectedStatus)?.label || selectedStatus
        await notificationAPI.create({
          userId: order.userId,
          type: 'order',
          title: `Order ${statusLabel}`,
          message: statusNote || `Your order ${order.orderNumber} has been ${statusLabel.toLowerCase()}`,
          status: 'new',
          relatedId: order._id,
          relatedType: 'order',
          linkTo: `/order-tracking/${order._id}`
        })
        
        setSnackbar({
          isOpen: true,
          type: 'success',
          message: `Order status updated and customer notified!`
        })
        
        // Refresh order
        await fetchOrder()
        setStatusNote('')
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      setSnackbar({
        isOpen: true,
        type: 'error',
        message: 'Failed to update order status'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    setIsUpdating(true)
    try {
      const updated = await orderAPI.updateStatus(
        order._id,
        'cancelled',
        customMessage || 'Order cancelled by admin',
        ''
      )
      
      if (updated) {
        // Send notification to customer
        await notificationAPI.create({
          userId: order.userId,
          type: 'order',
          title: 'Order Cancelled',
          message: customMessage || `Your order ${order.orderNumber} has been cancelled`,
          status: 'new',
          relatedId: order._id,
          relatedType: 'order',
          linkTo: `/my-orders`
        })
        
        setSnackbar({
          isOpen: true,
          type: 'success',
          message: 'Order cancelled and customer notified'
        })
        
        await fetchOrder()
        setCustomMessage('')
      }
    } catch (error) {
      setSnackbar({
        isOpen: true,
        type: 'error',
        message: 'Failed to cancel order'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendCustomMessage = async () => {
    if (!order || !customMessage.trim()) return
    
    try {
      await notificationAPI.create({
        userId: order.userId,
        type: 'reply',
        title: `Message about Order ${order.orderNumber}`,
        message: customMessage,
        status: 'new',
        relatedId: order._id,
        relatedType: 'order',
        linkTo: `/my-orders`
      })
      
      setSnackbar({
        isOpen: true,
        type: 'success',
        message: 'Message sent to customer!'
      })
      
      setCustomMessage('')
    } catch (error) {
      setSnackbar({
        isOpen: true,
        type: 'error',
        message: 'Failed to send message'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a]">
        <div className="container max-w-4xl">
          <button
            onClick={() => navigate('/orders')}
            className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </button>
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-cyan-100 mb-2">{error || 'Order Not Found'}</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a]">
      <div className="container max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-100 mb-2">
            Order {order.orderNumber || order._id.slice(-8)}
          </h1>
          <p className="text-cyan-300/70">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-cyan-300/70 text-sm">Name</p>
                  <p className="text-cyan-100 font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-cyan-300/70 text-sm">Email</p>
                  <p className="text-cyan-100">{order.customerEmail}</p>
                </div>
                {order.customerPhone && (
                  <div>
                    <p className="text-cyan-300/70 text-sm">Phone</p>
                    <p className="text-cyan-100">{order.customerPhone}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <Home className="h-5 w-5" />
                Shipping Address
              </h2>
              <div className="text-cyan-100">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="mt-1">{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-cyan-100 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName || item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-cyan-100 font-medium">{item.productName || item.name}</p>
                      <p className="text-cyan-300/70 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-cyan-100 font-bold">Rs {item.price * item.quantity}</p>
                  </div>
                ))}
                <div className="border-t border-cyan-400/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-cyan-100">Total</span>
                    <span className="text-2xl font-bold text-cyan-400">Rs {order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            {/* Update Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-cyan-100 mb-4">Update Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">Tracking Number (optional)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">Note to Customer</label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional message for the customer..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || selectedStatus === order.status}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update & Notify Customer'}
                </button>
              </div>
            </motion.div>

            {/* Send Custom Message */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-cyan-100 mb-4">Send Message</h2>
              
              <div className="space-y-4">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type a custom message to the customer..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none resize-none"
                />

                <button
                  onClick={handleSendCustomMessage}
                  disabled={!customMessage.trim()}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </div>
            </motion.div>

            {/* Cancel Order */}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-400/20 rounded-2xl p-6 backdrop-blur-xl"
              >
                <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
                
                <button
                  onClick={handleCancelOrder}
                  disabled={isUpdating}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        type={snackbar.type}
        message={snackbar.message}
      />
    </div>
  )
}
