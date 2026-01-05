import HeroSection from '@/components/home/HeroSection'
import ProductSection from '@/components/home/ProductSection'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton'
import { useState, useEffect } from 'react'
import { productAPI } from '@/services/api'
import { Link } from 'react-router-dom'
import type { Product } from '@/types/product'
import { Sparkles, Loader2 } from 'lucide-react'

// Global cache for homepage products
let cachedProducts: Product[] | null = null

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(() => cachedProducts || [])
  const [loading, setLoading] = useState(cachedProducts === null)

  useEffect(() => {
    // If already cached, skip loading
    if (cachedProducts && cachedProducts.length > 0) {
      setProducts(cachedProducts)
      setLoading(false)
      return
    }
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await productAPI.getAll()
      // Filter to show ONLY children products (not parents or grandchildren)
      const childProducts = data.filter(p => p.productType === 'child')
      cachedProducts = childProducts
      setProducts(childProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter products by different criteria
  const trendingProducts = products
    .filter(p => p.rating >= 4.5)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))

  const bestSellers = products
    .filter(p => (p.reviewCount || 0) > 5)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))

  const newArrivals = products
    .slice()
    .sort((a, b) => (b.id || '').localeCompare(a.id || ''))

  const gamingAccessories = products
    .filter(p => {
      const name = p.name.toLowerCase()
      return name.includes('gaming') || 
             name.includes('headphone') || 
             name.includes('mouse') || 
             name.includes('keyboard') ||
             name.includes('controller') ||
             name.includes('chair')
    })

  const electronics = products
    .filter(p => {
      const name = p.name.toLowerCase()
      return name.includes('cooler') || 
             name.includes('fan') || 
             name.includes('rgb') ||
             name.includes('monitor') ||
             name.includes('cable') ||
             name.includes('adapter')
    })

  return (
    <div className="pt-16 w-full min-h-screen bg-[#050810] dark:bg-[#050810]">
      {/* Full-Width Hero Slider */}
      <HeroSection />

      {/* Loading State */}
      {loading ? (
        <div className="container py-12 md:py-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/30">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
                  Loading Products...
                </span>
              </h2>
            </div>
            <p className="text-cyan-200/70 ml-14">Fetching the best gaming gear for you</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
            <ProductCardSkeleton count={10} />
          </div>
        </div>
      ) : (
        <>
          {/* Trending Products Section */}
          {trendingProducts.length > 0 && (
            <ProductSection
              title="Trending Now"
              description="Hot picks that gamers are loving right now"
              products={trendingProducts}
              icon="trending"
            />
          )}

          {/* Best Sellers Section */}
          {bestSellers.length > 0 && (
            <ProductSection
              title="Best Sellers"
              description="Top-rated gaming gear with proven performance"
              products={bestSellers}
              icon="popular"
            />
          )}

          {/* Gaming Accessories Section */}
          {gamingAccessories.length > 0 && (
            <ProductSection
              title="Gaming Accessories"
              description="Essential gear for the ultimate gaming experience"
              products={gamingAccessories}
              icon="new"
              gradient="from-green-500 via-emerald-500 to-teal-500"
            />
          )}

          {/* Electronics & Tech Section */}
          {electronics.length > 0 && (
            <ProductSection
              title="Gaming Electronics"
              description="High-tech gaming equipment and peripherals"
              products={electronics}
              icon="electronics"
            />
          )}

          {/* New Arrivals Section */}
          {newArrivals.length > 0 && (
            <ProductSection
              title="New Arrivals"
              description="Fresh gaming products just added to our collection"
              products={newArrivals}
              icon="new"
            />
          )}
        </>
      )}

      {/* Enhanced CTA Section - Static, no animations */}
      <section className="relative border-t border-cyan-400/10 py-20 md:py-28 overflow-hidden">
        {/* Static Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-2 backdrop-blur-xl border border-cyan-400/20">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Level Up Your Gaming</span>
            </div>
            
            <h2 className="mb-4 text-3xl md:text-5xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Ready to Dominate?
              </span>
            </h2>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-cyan-200/70">
              Experience gaming gear like never before with immersive 3D previews, instant checkout, and premium quality products designed for champions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products">
                <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-cyan-500/50 ring-2 ring-cyan-400 backdrop-blur-sm hover:opacity-90">
                  Start Shopping Now
                </button>
              </Link>
              
              <Link to="/products">
                <button className="inline-flex items-center justify-center rounded-xl border-2 border-cyan-400 bg-cyan-500/10 px-8 py-4 text-base font-semibold text-cyan-100 backdrop-blur-xl hover:bg-cyan-500/20">
                  View 3D Gallery
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />

      <Footer />
    </div>
  )
}
