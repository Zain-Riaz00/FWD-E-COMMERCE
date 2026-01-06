import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Tag, Calendar, User, Plus, Truck, CheckCircle, Clock, XCircle, MapPin, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { orderAPI, discountAPI } from '@/services/api'

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl?: string
}

interface StatusHistoryItem {
  status: string
  timestamp: string
  note?: string
}

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  statusHistory: StatusHistoryItem[]
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  discountCode?: string
  discountAmount?: number
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
}

interface Discount {
  _id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  expiresAt: string
  usageCount: number
  maxUses?: number
  isActive: boolean
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: MapPin },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle }
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'discounts'>('orders')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [showCreateDiscount, setShowCreateDiscount] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: '', note: '', trackingNumber: '' })
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minOrder: 0,
    maxUses: 100,
    expiresAt: ''
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    loadData()
  }, [isAdmin, navigate])

  async function loadData() {
    setLoading(true)
    try {
      const [ordersData, discountsData] = await Promise.all([
        orderAPI.getAll(),
        discountAPI.getAll()
      ])
      
      setOrders(ordersData as Order[])
      setDiscounts(discountsData as Discount[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!showStatusModal || !statusUpdate.status) return
    
    const result = await orderAPI.updateStatus(
      showStatusModal._id,
      statusUpdate.status,
      statusUpdate.note,
      statusUpdate.trackingNumber || undefined
    )
    
    if (result) {
      setOrders(prev => prev.map(o => 
        o._id === showStatusModal._id ? { ...o, ...result } : o
      ))
      setShowStatusModal(null)
      setStatusUpdate({ status: '', note: '', trackingNumber: '' })
    }
  }

  const handleCreateDiscount = async () => {
    if (!newDiscount.code || !newDiscount.expiresAt) return
    
    const result = await discountAPI.create({
      ...newDiscount,
      expiresAt: new Date(newDiscount.expiresAt).toISOString()
    })
    
    if (result) {
      setDiscounts(prev => [result, ...prev])
      setShowCreateDiscount(false)
      setNewDiscount({ code: '', type: 'percentage', value: 10, minOrder: 0, maxUses: 100, expiresAt: '' })
    }
  }

  const handleDeleteDiscount = async (id: string) => {
    if (await discountAPI.delete(id)) {
      setDiscounts(prev => prev.filter(d => d._id !== id))
    }
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-16 pb-12 w-full px-4 sm:px-6 lg:px-8 bg-[#050810]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Orders & Discounts
          </h1>
          <p className="text-cyan-200/70">Manage customer orders and discount codes</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-lg text-cyan-300 hover:bg-cyan-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'orders'
              ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40'
              : 'text-cyan-200/70 hover:bg-cyan-500/10'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'discounts'
              ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40'
              : 'text-cyan-200/70 hover:bg-cyan-500/10'
          }`}
        >
          <Tag className="w-4 h-4 inline mr-2" />
          Discounts ({discounts.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-white/60 mt-4">Loading...</p>
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders Tab */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
              <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No orders yet</p>
              <p className="text-white/40 text-sm mt-2">Orders will appear here when customers place them</p>
            </div>
          ) : (
            orders.map((order, index) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock
              const isExpanded = expandedOrder === order._id
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${statusConfig[order.status]?.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[order.status]?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {order.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          {order.trackingNumber && (
                            <span className="flex items-center gap-1 text-cyan-400">
                              <Truck className="w-4 h-4" />
                              {order.trackingNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-400">Rs. {order.totalAmount.toFixed(2)}</p>
                        {order.discountCode && (
                          <p className="text-xs text-green-400">Discount: {order.discountCode} (-Rs. {order.discountAmount?.toFixed(2)})</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowStatusModal(order)}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 rounded-lg text-sm hover:from-cyan-500/30 hover:to-blue-500/30 transition-all ring-1 ring-cyan-400/30"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="px-3 py-1.5 bg-white/5 text-white/70 rounded-lg text-sm hover:bg-white/10 transition-all flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 p-6 bg-black/20"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Items */}
                        <div>
                          <h4 className="text-sm font-medium text-white/70 mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm bg-white/5 rounded-lg p-3">
                                <div>
                                  <span className="text-white">{item.productName}</span>
                                  <span className="text-white/50 ml-2">x{item.quantity}</span>
                                </div>
                                <span className="text-cyan-400">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h4 className="text-sm font-medium text-white/70 mb-3">Shipping Address</h4>
                          <div className="bg-white/5 rounded-lg p-4 text-sm">
                            <p className="text-white font-medium">{order.shippingAddress?.fullName}</p>
                            <p className="text-white/60">{order.shippingAddress?.phone}</p>
                            <p className="text-white/60 mt-2">
                              {order.shippingAddress?.address}<br />
                              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status History */}
                      {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-white/70 mb-3">Status History</h4>
                          <div className="space-y-2">
                            {order.statusHistory.map((history, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-sm">
                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span className="text-white capitalize">{history.status.replace('_', ' ')}</span>
                                <span className="text-white/50">{new Date(history.timestamp).toLocaleString()}</span>
                                {history.note && <span className="text-white/40">- {history.note}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      ) : (
        /* Discounts Tab */
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateDiscount(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 rounded-lg ring-1 ring-cyan-400/40 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Discount
          </button>

          {discounts.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
              <Tag className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No discounts yet</p>
              <p className="text-white/40 text-sm mt-2">Create discount codes for your customers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount, index) => (
                <motion.div
                  key={discount._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-white/5 p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <code className="text-xl font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded">{discount.code}</code>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      discount.isActive && new Date(discount.expiresAt) > new Date()
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {discount.isActive && new Date(discount.expiresAt) > new Date() ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Discount:</span>
                      <span className="text-white font-medium">
                        {discount.type === 'percentage' ? `${discount.value}%` : `Rs. ${discount.value}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Min Order:</span>
                      <span className="text-white">Rs. {discount.minOrder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Used:</span>
                      <span className="text-white">{discount.usageCount} / {discount.maxUses || '∞'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Expires:</span>
                      <span className="text-white">{new Date(discount.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDiscount(discount._id)}
                    className="mt-4 w-full px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e1a] rounded-xl border border-cyan-500/30 p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Update Order Status</h3>
            <p className="text-white/60 text-sm mb-4">Order: {showStatusModal.orderNumber}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">New Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select status...</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(statusUpdate.status === 'shipped' || statusUpdate.status === 'out_for_delivery') && (
                <div>
                  <label className="block text-sm text-white/70 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={statusUpdate.trackingNumber}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="e.g. TRK123456789"
                    className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-white/70 mb-2">Note (Optional)</label>
                <textarea
                  value={statusUpdate.note}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Add a note about this status update..."
                  rows={2}
                  className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(null)
                  setStatusUpdate({ status: '', note: '', trackingNumber: '' })
                }}
                className="flex-1 px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!statusUpdate.status}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Discount Modal */}
      {showCreateDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0e1a] rounded-xl border border-cyan-500/30 p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Create Discount Code</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Code</label>
                <input
                  type="text"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SAVE20"
                  className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Type</label>
                  <select
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Value</label>
                  <input
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Min Order (Rs.)</label>
                  <input
                    type="number"
                    value={newDiscount.minOrder}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, minOrder: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={newDiscount.maxUses}
                    onChange={(e) => setNewDiscount(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Expires On</label>
                <input
                  type="date"
                  value={newDiscount.expiresAt}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateDiscount(false)}
                className="flex-1 px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDiscount}
                disabled={!newDiscount.code || !newDiscount.expiresAt}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
