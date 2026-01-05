import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, Package, TrendingDown, RefreshCw, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { productAPI } from '@/services/api'
import type { Product } from '@/types/product'

interface InventoryItem {
  id: string
  productId: string
  productName: string
  imageUrl: string
  currentStock: number
  minStock: number
  status: 'critical' | 'low' | 'normal'
  lastUpdated: string
}

// Cache for inventory
let cachedInventory: InventoryItem[] | null = null

export default function InventoryAlertsPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [inventory, setInventory] = useState<InventoryItem[]>(cachedInventory || [])
  const [loading, setLoading] = useState(cachedInventory === null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    if (cachedInventory === null) {
      loadInventory()
    }
  }, [isAdmin, navigate])

  async function loadInventory() {
    setLoading(true)
    try {
      const products = await productAPI.getAll()
      
      // Convert products to inventory items with random stock levels for demo
      const inventoryItems: InventoryItem[] = products.slice(0, 20).map((product: Product) => {
        const currentStock = Math.floor(Math.random() * 50)
        const minStock = 10
        let status: 'critical' | 'low' | 'normal' = 'normal'
        if (currentStock <= 5) status = 'critical'
        else if (currentStock <= minStock) status = 'low'

        return {
          id: product.id,
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          currentStock,
          minStock,
          status,
          lastUpdated: new Date().toISOString()
        }
      })

      cachedInventory = inventoryItems
      setInventory(inventoryItems)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = (itemId: string, change: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.currentStock + change)
        let status: 'critical' | 'low' | 'normal' = 'normal'
        if (newStock <= 5) status = 'critical'
        else if (newStock <= item.minStock) status = 'low'
        
        return { ...item, currentStock: newStock, status, lastUpdated: new Date().toISOString() }
      }
      return item
    }))
    
    // Update cache
    cachedInventory = inventory.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.currentStock + change)
        let status: 'critical' | 'low' | 'normal' = 'normal'
        if (newStock <= 5) status = 'critical'
        else if (newStock <= item.minStock) status = 'low'
        
        return { ...item, currentStock: newStock, status, lastUpdated: new Date().toISOString() }
      }
      return item
    })
  }

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  const criticalCount = inventory.filter(i => i.status === 'critical').length
  const lowCount = inventory.filter(i => i.status === 'low').length

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Inventory Alerts
          </h1>
          <p className="text-cyan-200/70">Monitor and manage product stock levels</p>
        </div>
        <button
          onClick={loadInventory}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-100 rounded-lg ring-1 ring-cyan-400/40 hover:bg-cyan-500/30 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Critical (≤5)</p>
              <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Low Stock (≤10)</p>
              <p className="text-3xl font-bold text-yellow-400">{lowCount}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/30 rounded-lg">
              <Package className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-green-400">{inventory.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 border border-cyan-400/20 mb-6 w-fit">
        {(['all', 'critical', 'low'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === f
                ? f === 'critical' ? 'bg-red-500/30 text-red-100' :
                  f === 'low' ? 'bg-yellow-500/30 text-yellow-100' :
                  'bg-cyan-500/30 text-cyan-100'
                : 'text-gray-400 hover:text-cyan-200'
            }`}
          >
            {f === 'all' ? 'All Items' : f === 'critical' ? 'Critical' : 'Low Stock'}
            {f === 'critical' && criticalCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{criticalCount}</span>
            )}
            {f === 'low' && lowCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">{lowCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Inventory List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/60 mt-4">Loading inventory...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 p-12 rounded-2xl border border-white/10 text-center">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">No items match this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`backdrop-blur-xl bg-white/5 p-4 rounded-xl border transition-all ${
                item.status === 'critical' ? 'border-red-500/50 hover:border-red-500' :
                item.status === 'low' ? 'border-yellow-500/50 hover:border-yellow-500' :
                'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-800"
                />
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{item.productName}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                      item.status === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.status === 'critical' ? 'Critical' : item.status === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">Min: {item.minStock} units</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs">Current Stock</p>
                  <p className={`text-2xl font-bold ${
                    item.status === 'critical' ? 'text-red-400' :
                    item.status === 'low' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {item.currentStock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStock(item.id, -1)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStock(item.id, 1)}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStock(item.id, 10)}
                    className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium transition-all"
                  >
                    +10
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
