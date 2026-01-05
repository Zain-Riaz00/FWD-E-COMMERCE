import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Tag, Calendar, User, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  items: { productName: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  discountApplied?: string
}

interface Discount {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  expiresAt: string
  usageCount: number
  isActive: boolean
}

// Cache for orders
let cachedOrders: Order[] | null = null
let cachedDiscounts: Discount[] | null = null

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [orders, setOrders] = useState<Order[]>(cachedOrders || [])
  const [discounts, setDiscounts] = useState<Discount[]>(cachedDiscounts || [])
  const [loading, setLoading] = useState(cachedOrders === null)
  const [activeTab, setActiveTab] = useState<'orders' | 'discounts'>('orders')
  const [showCreateDiscount, setShowCreateDiscount] = useState(false)
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minOrder: 0,
    expiresAt: ''
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    if (cachedOrders === null) {
      loadData()
    }
  }, [isAdmin, navigate])

  async function loadData() {
    setLoading(true)
    try {
      // Mock orders data
      const mockOrders: Order[] = [
        {
          id: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          items: [
            { productName: 'Gaming Headset Pro', quantity: 1, price: 129.99 },
            { productName: 'RGB Mouse Pad', quantity: 2, price: 29.99 }
          ],
          total: 189.97,
          status: 'delivered',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          items: [
            { productName: 'Mechanical Keyboard', quantity: 1, price: 159.99 }
          ],
          total: 159.99,
          status: 'processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          discountApplied: 'SAVE10'
        },
        {
          id: 'ORD-003',
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com',
          items: [
            { productName: 'Gaming Chair', quantity: 1, price: 299.99 },
            { productName: 'Monitor Stand', quantity: 1, price: 49.99 }
          ],
          total: 349.98,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]

      const mockDiscounts: Discount[] = [
        {
          id: 'DSC-001',
          code: 'SAVE10',
          type: 'percentage',
          value: 10,
          minOrder: 50,
          expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
          usageCount: 15,
          isActive: true
        },
        {
          id: 'DSC-002',
          code: 'FLAT20',
          type: 'fixed',
          value: 20,
          minOrder: 100,
          expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
          usageCount: 5,
          isActive: true
        }
      ]

      cachedOrders = mockOrders
      cachedDiscounts = mockDiscounts
      setOrders(mockOrders)
      setDiscounts(mockDiscounts)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscount = () => {
    const discount: Discount = {
      id: `DSC-${Date.now()}`,
      ...newDiscount,
      usageCount: 0,
      isActive: true
    }
    setDiscounts(prev => [...prev, discount])
    cachedDiscounts = [...(cachedDiscounts || []), discount]
    setShowCreateDiscount(false)
    setNewDiscount({ code: '', type: 'percentage', value: 10, minOrder: 0, expiresAt: '' })
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Orders & Discounts
        </h1>
        <p className="text-cyan-200/70">Manage customer orders and discount codes</p>
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
            </div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/5 p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white">{order.id}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
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
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">Rs. {order.total.toFixed(2)}</p>
                    {order.discountApplied && (
                      <p className="text-xs text-green-400">Discount: {order.discountApplied}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-white/70 mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-white/60">{item.productName} x{item.quantity}</span>
                        <span className="text-white/80">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((discount, index) => (
                <motion.div
                  key={discount.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-white/5 p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <code className="text-xl font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded">{discount.code}</code>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${discount.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {discount.isActive ? 'Active' : 'Inactive'}
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
                      <span className="text-white">{discount.usageCount} times</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Expires:</span>
                      <span className="text-white">{new Date(discount.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
              <div>
                <label className="block text-sm text-white/70 mb-1">Minimum Order (Rs.)</label>
                <input
                  type="number"
                  value={newDiscount.minOrder}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, minOrder: Number(e.target.value) }))}
                  className="w-full px-4 py-2 bg-black/30 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
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
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
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
