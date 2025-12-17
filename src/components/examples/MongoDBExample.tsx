import { useEffect, useState } from 'react'
import { productAPI, checkServerHealth } from '@/services/api'
import type { Product } from '@/types/product'

/**
 * Example component showing how to use MongoDB API
 * You can integrate this into your existing pages
 */
export default function MongoDBExample() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState<any>(null)

  useEffect(() => {
    loadProducts()
    checkHealth()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const data = await productAPI.getAll()
    setProducts(data)
    setLoading(false)
  }

  const checkHealth = async () => {
    const health = await checkServerHealth()
    setServerStatus(health)
  }

  const handleCreateProduct = async () => {
    const newProduct = await productAPI.create({
      name: 'New Product from Frontend',
      price: 99.99,
      description: 'This product was created from the frontend',
      imageUrl: 'https://picsum.photos/seed/new-product/800/800',
      rating: 4.0,
      reviewCount: 0,
      category: 'Test',
      stock: 10
    })

    if (newProduct) {
      console.log('Product created:', newProduct)
      loadProducts() // Reload products
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const success = await productAPI.delete(id)
    if (success) {
      console.log('Product deleted')
      loadProducts() // Reload products
    }
  }

  if (loading) {
    return <div className="p-8">Loading products from MongoDB...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">MongoDB Integration Example</h1>
        
        {/* Server Status */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Server Status</h2>
          {serverStatus ? (
            <div>
              <p>Status: <span className="text-green-400">{serverStatus.status}</span></p>
              <p>Database: <span className="text-green-400">{serverStatus.database}</span></p>
              <p>Message: {serverStatus.message}</p>
            </div>
          ) : (
            <p className="text-red-400">Server not connected</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleCreateProduct}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
          >
            Create Test Product
          </button>
          <button
            onClick={loadProducts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Refresh Products
          </button>
        </div>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Products from MongoDB ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="text-gray-400">No products found. Run `npm run seed` to add sample data.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-cyan-400 font-bold">Rs. {product.price}</span>
                  <span className="text-yellow-400">⭐ {product.rating}</span>
                </div>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
