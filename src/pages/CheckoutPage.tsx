import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Edit2, User, Phone, Home, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Product } from '@/types/product'
import { useCart } from '@/context/CartContext'
import Snackbar from '@/components/ui/Snackbar'
import { orderAPI, notificationAPI } from '@/services/api'

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
  const { items, totalPrice, totalQuantity, removeItem } = useCart()

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
  const [snackbar, setSnackbar] = useState({ isOpen: false, type: 'success' as 'success' | 'error', message: '' })
  const [isProcessing, setIsProcessing] = useState(false)

  // Determine if this is cart checkout or single product checkout
  const isCartCheckout = !state?.product && items.length > 0
  const isSingleProductCheckout = !!state?.product

  const handleSaveAddress = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    userProfile.address = userAddress
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    setIsEditing(false)
  }

  const handleProceedToOrder = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      // Get user from localStorage
      let userId: string | undefined
      let userEmail = 'guest@example.com'
      let userName = userAddress.fullName
      
      const userJson = localStorage.getItem('user')
      if (userJson) {
        try {
          const user = JSON.parse(userJson)
          userId = user._id
          userEmail = user.email || userEmail
          userName = user.name || userName
        } catch (e) {
          console.error('Failed to parse user data:', e)
        }
      }

      let orderData
      if (isCartCheckout) {
        // For cart checkout
        orderData = {
          userId,
          customerEmail: userEmail,
          customerName: userName,
          customerPhone: userAddress.phone,
          items: items.map(item => ({
            productId: item._id || item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl
          })),
          totalAmount: totalPrice,
          shippingAddress: {
            fullName: userAddress.fullName,
            phone: userAddress.phone,
            address: userAddress.address,
            city: userAddress.city,
            state: userAddress.state,
            zipCode: userAddress.zipCode
          },
          paymentMethod: 'card'
        }
      } else if (isSingleProductCheckout) {
        // For single product checkout
        orderData = {
          userId,
          customerEmail: userEmail,
          customerName: userName,
          customerPhone: userAddress.phone,
          items: [{
            productId: state!.product._id || state!.product.id,
            productName: state!.product.name,
            quantity: state!.quantity || 1,
            price: state!.product.price,
            imageUrl: state!.product.imageUrl
          }],
          totalAmount: state!.product.price * (state!.quantity || 1),
          shippingAddress: {
            fullName: userAddress.fullName,
            phone: userAddress.phone,
            address: userAddress.address,
            city: userAddress.city,
            state: userAddress.state,
            zipCode: userAddress.zipCode
          },
          paymentMethod: 'card'
        }
      }

      // Create order
      const order = await orderAPI.create(orderData)
      
      if (order && order._id) {
        // Create notification for user
        await notificationAPI.create({
          userId,
          type: 'order',
          title: 'Order Placed Successfully',
          message: `Your order ${order.orderNumber || 'has been placed'}. We'll notify you when it ships.`,
          status: 'new',
          relatedId: order._id,
          relatedType: 'order',
          linkTo: `/my-orders`
        })

        // Create notification for admin
        await notificationAPI.create({
          type: 'order',
          title: 'New Order Received',
          message: `Order ${order.orderNumber} from ${orderData.customerName}. Total: Rs ${order.totalAmount}`,
          status: 'new',
          relatedId: order._id,
          relatedType: 'order',
          linkTo: `/admin/order/${order._id}`,
          isAdminNotification: true
        })

        // Trigger notification update
        window.dispatchEvent(new CustomEvent('global-notifications-update'))

        // Show success snackbar
        setSnackbar({
          isOpen: true,
          type: 'success',
          message: `Order ${order.orderNumber || ''} placed successfully! 🎉`
        })

        // Clear cart if cart checkout
        if (isCartCheckout) {
          items.forEach(item => {
            const productId = item._id || item.id
            if (productId) removeItem(productId)
          })
        } else {
          // Remove single item from cart
          const productId = state?.product._id || state?.product.id
          if (productId) removeItem(productId)
        }

        // Navigate to order confirmation after short delay
        setTimeout(() => {
          navigate('/my-orders', { state: { orderId: order._id } })
        }, 1500)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      setSnackbar({
        isOpen: true,
        type: 'error',
        message: 'Failed to place order. Please try again.'
      })
      setIsProcessing(false)
    }
  }

  // If no checkout data, redirect to cart or home
  if (!isCartCheckout && !isSingleProductCheckout) {
    navigate('/cart')
    return null
  }

  // Calculate totals based on checkout type
  const orderTotal = isCartCheckout ? totalPrice : (state!.product.price * (state!.quantity || 1))
  const orderQuantity = isCartCheckout ? totalQuantity : (state!.quantity || 1)

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
            
            {isCartCheckout ? (
              // Display cart items
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-cyan-50 mb-1">{item.product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 text-sm">Quantity: {item.quantity}</span>
                        <span className="font-bold text-cyan-400">
                          Rs. {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-cyan-400/10 flex justify-between items-center">
                  <span className="text-cyan-200">Total ({orderQuantity} items)</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Rs. {orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              // Display single product
              <div className="flex gap-4">
                <img
                  src={state!.product.imageUrl}
                  alt={state!.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-cyan-50 mb-1">{state!.product.name}</h3>
                  <p className="text-cyan-200/70 text-sm mb-2">{state!.product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">Quantity: {state!.quantity || 1}</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      Rs. {orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
            disabled={!userAddress.fullName || !userAddress.phone || !userAddress.address || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Order...
              </>
            ) : (
              <>
                Place Order
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </motion.div>
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
