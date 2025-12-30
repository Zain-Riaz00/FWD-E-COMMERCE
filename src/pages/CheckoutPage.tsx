import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Edit2, User, Phone, Home, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Product } from '@/types/product'

interface CheckoutState {
  product: Product
  quantity: number
}

interface Address {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as CheckoutState | undefined

  const [isEditing, setIsEditing] = useState(false)
  // Initialize address from localStorage
  const initialAddress = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    if (userProfile.address) {
      return userProfile.address
    }
    return {
      fullName: userProfile.name || '',
      phone: userProfile.phone || '',
      address: userProfile.address || '',
      city: userProfile.city || '',
      state: userProfile.state || '',
      zipCode: userProfile.zipCode || '',
    }
  }

  const [userAddress, setUserAddress] = useState<Address>(initialAddress)

  // Removed redirect - checkout page can work with cart items too
  // useEffect(() => {
  //   if (!state?.product) {
  //     navigate('/')
  //   }
  // }, [state, navigate])

  const handleSaveAddress = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    userProfile.address = userAddress
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    setIsEditing(false)
  }

  const handleProceedToOrder = () => {
    navigate('/order-confirmation', {
      state: {
        product: state?.product,
        quantity: state?.quantity || 1,
        address: userAddress,
      },
    })
  }

  if (!state?.product) return null

  const { product, quantity = 1 } = state
  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[#0a0e1a] via-[#050810] to-[#0a0e1a]">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Checkout
              </span>
            </h1>
            <p className="text-cyan-200/70">Review your order and delivery address</p>
          </div>

          {/* Product Summary */}
          <div className="mb-8 p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-cyan-100 mb-4">Order Summary</h2>
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
                  <span className="text-cyan-300">Quantity: {quantity}</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-8 p-6 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/90 to-[#020304]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-cyan-100">Delivery Address</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-cyan-400 mt-1" />
                  <div>
                    <p className="text-sm text-cyan-300/70">Full Name</p>
                    <p className="text-cyan-100">{userAddress.fullName || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-cyan-400 mt-1" />
                  <div>
                    <p className="text-sm text-cyan-300/70">Phone</p>
                    <p className="text-cyan-100">{userAddress.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="h-4 w-4 text-cyan-400 mt-1" />
                  <div>
                    <p className="text-sm text-cyan-300/70">Address</p>
                    <p className="text-cyan-100">
                      {userAddress.address || 'Not set'}<br />
                      {userAddress.city && `${userAddress.city}, `}
                      {userAddress.state} {userAddress.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userAddress.fullName}
                    onChange={(e) => setUserAddress({ ...userAddress, fullName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={userAddress.phone}
                    onChange={(e) => setUserAddress({ ...userAddress, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">Address</label>
                  <input
                    type="text"
                    value={userAddress.address}
                    onChange={(e) => setUserAddress({ ...userAddress, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cyan-300/70 mb-2">City</label>
                    <input
                      type="text"
                      value={userAddress.city}
                      onChange={(e) => setUserAddress({ ...userAddress, city: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-300/70 mb-2">State</label>
                    <input
                      type="text"
                      value={userAddress.state}
                      onChange={(e) => setUserAddress({ ...userAddress, state: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-cyan-300/70 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={userAddress.zipCode}
                    onChange={(e) => setUserAddress({ ...userAddress, zipCode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-cyan-400/20 text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-lg border-2 border-cyan-400 bg-transparent text-cyan-100 font-semibold hover:bg-cyan-500/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceedToOrder}
            disabled={!userAddress.fullName || !userAddress.phone || !userAddress.address}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Order Confirmation
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
