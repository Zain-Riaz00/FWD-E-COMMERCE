import { useCart } from '@/context/CartContext'
import QuantitySelector from '@/components/products/QuantitySelector'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import LoadingOverlay from '@/components/ui/LoadingOverlay'

export default function CartPage() {
  const { items, totalPrice, totalQuantity, updateQuantity, removeItem, clear } = useCart()
  const navigate = useNavigate()
  const [colorSelections, setColorSelections] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Green']

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  function handleColorChange(productId: string, newColor: string) {
    setColorSelections(prev => ({ ...prev, [productId]: newColor }))
  }

  function handlePreviewColor(productId: string) {
    // Navigate to immersive mode for this product
    // Extract base product ID (remove color suffix if present)
    const baseId = productId.split('-').slice(0, -1).join('-') || productId
    navigate(`/products/immersive/${baseId}`)
  }

  return (
    <>
      <LoadingOverlay isVisible={isLoading} text="Loading Cart" />
      <section className="container pt-16 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-cyan-200/70 hover:text-cyan-100 transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-cyan-400/10 bg-gradient-to-br from-[#0a0e1a]/80 to-[#020304]/80 p-8 text-center text-cyan-200/70 dark:text-cyan-200/70 text-slate-900 backdrop-blur-sm">
          Your cart is empty.{' '}
          <Link className="text-zinc-200 dark:text-zinc-200 text-blue-600 underline font-semibold" to="/products">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[7fr_3fr]">
          {/* Items column */}
          <div
            className="max-h-[65vh] overflow-y-auto rounded-xl bg-black/50 p-4 ring-1 ring-inset ring-cyan-400/10"
            style={{ boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.45)' }}
          >
            <div className="space-y-4">
              {items.map(({ product, quantity }, idx) => {
                const selectedColor = colorSelections[product.id] || product.color || 'Black'
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: idx * 0.04 }}
                    className="rounded-xl bg-white/5 p-4 backdrop-blur ring-1 ring-[#00FFFF]/30"
                    style={{
                      boxShadow:
                        '0 0 8px rgba(0,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-cyan-400/20"
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Product name and rating */}
                        <div>
                          <p className="text-sm font-semibold text-cyan-100">{product.name}</p>
                          <p className="mt-0.5 text-xs text-cyan-200/70">Rating {product.rating.toFixed(1)} / 5</p>
                        </div>

                        {/* Color selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-cyan-300/80">Color:</label>
                          <select
                            value={selectedColor}
                            onChange={(e) => handleColorChange(product.id, e.target.value)}
                            className="rounded-md border border-cyan-400/30 bg-black/50 px-2 py-1 text-xs text-cyan-100 backdrop-blur-sm focus:border-cyan-400/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                          >
                            {availableColors.map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>

                          {/* Preview button */}
                          <button
                            onClick={() => handlePreviewColor(product.id)}
                            className="flex items-center gap-1 rounded-md bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-100 ring-1 ring-cyan-400/40 transition hover:bg-cyan-500/30"
                            title="Preview in 3D"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                        </div>

                        {/* Price, quantity, and remove */}
                        <div className="flex items-center gap-3">
                          <QuantitySelector min={1} max={20} onChange={(v) => updateQuantity(product.id, v)} />
                          <p className="w-20 text-right text-sm font-medium text-cyan-100">
                            Rs. {(product.price * quantity).toFixed(2)}
                          </p>
                          <Button onClick={() => removeItem(product.id)} className="h-8 px-3 text-xs">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Summary column */}
          <aside
            className="rounded-xl bg-white/8 p-6 text-cyan-100 backdrop-blur-2xl ring-1 ring-inset ring-[#00FFFF]/25"
            style={{ boxShadow: '0 0 20px rgba(0,255,255,0.12)' }}
          >
            <h2 className="mb-4 text-lg font-semibold neon-glow-text">Checkout Summary</h2>
            <div className="space-y-2 text-sm text-cyan-200/80">
              <div className="flex justify-between"><span>Items</span><span>{totalQuantity}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
            </div>
            <div className="mt-5 rounded-lg bg-black/30 p-4 ring-1 ring-cyan-400/15">
              <p className="text-xs uppercase tracking-wide text-cyan-300/60">Total</p>
              <p className="neon-blink mt-1 text-3xl font-extrabold text-cyan-200">Rs. {totalPrice.toFixed(2)}</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button className="w-full" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
              <Button className="w-full bg-cyan-600/30 hover:bg-cyan-600/40" onClick={clear}>Clear</Button>
            </div>
          </aside>
        </div>
      )}
    </section>
    </>
  )
}
