import { Router, Request, Response } from 'express'
import Product from '../models/Product'

const router = Router()

// Simple in-memory cache
let productsCache: any = null
let cacheTime: number = 0
const CACHE_DURATION = 60000 // 60 seconds cache

// Mock data for instant loading when database is slow
const mockProducts = [
  {
    _id: 'mock1',
    name: 'Nike Air Max 270',
    price: 150,
    description: 'The Nike Air Max 270 delivers visible cushioning under every step.',
    imageUrl: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/f0e66015-9863-4d32-bdb3-81a9b3f0fe13/air-max-270-shoes-2V5C4p.png',
    rating: 4.5,
    reviewCount: 128,
    category: 'Running',
    stock: 50,
    colors: ['black', 'white', 'red'],
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock2',
    name: 'Adidas Ultraboost 22',
    price: 180,
    description: 'Experience incredible energy return with the Adidas Ultraboost.',
    imageUrl: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',
    rating: 4.7,
    reviewCount: 256,
    category: 'Running',
    stock: 35,
    colors: ['black', 'white'],
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock3',
    name: 'Jordan 1 Retro High',
    price: 170,
    description: 'The Air Jordan 1 Retro High remakes the original that debuted in 1985.',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/air-jordan-1-retro-high-og-shoes-KW4p5k.png',
    rating: 4.9,
    reviewCount: 512,
    category: 'Basketball',
    stock: 20,
    colors: ['red', 'black', 'white'],
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock4',
    name: 'New Balance 990v5',
    price: 185,
    description: 'Made in USA. The 990v5 is the latest evolution of the classic 990 series.',
    imageUrl: 'https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i?$pdpflexf2$&wid=440&hei=440',
    rating: 4.6,
    reviewCount: 89,
    category: 'Lifestyle',
    stock: 45,
    colors: ['grey', 'navy'],
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock5',
    name: 'Puma RS-X',
    price: 110,
    description: 'The RS-X reinvents Puma classic running technology.',
    imageUrl: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/371008/03/sv01/fnd/PNA/fmt/png',
    rating: 4.3,
    reviewCount: 67,
    category: 'Lifestyle',
    stock: 60,
    colors: ['white', 'blue', 'purple'],
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'mock6',
    name: 'Vans Old Skool',
    price: 65,
    description: 'The Vans Old Skool is a classic skate shoe with iconic side stripe.',
    imageUrl: 'https://images.vans.com/is/image/Vans/VN000D3HY28-HERO?wid=800&hei=800&fmt=jpeg&qlt=50&resMode=sharp2&op_usm=0.9,1.5,8,0',
    rating: 4.4,
    reviewCount: 342,
    category: 'Skate',
    stock: 100,
    colors: ['black', 'white', 'red', 'navy'],
    colorVariants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Get all products with caching and optimization
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now()
  console.log('[Products API] Request received at:', new Date().toISOString())
  
  try {
    const now = Date.now()
    
    // Return cached data if still valid
    if (productsCache && (now - cacheTime) < CACHE_DURATION) {
      console.log('[Products API] Returning cached data')
      return res.json(productsCache)
    }

    console.log('[Products API] Fetching from database...')
    
    // Create a promise that rejects after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    })
    
    // Race between database query and timeout
    const dbPromise = Product.find()
      .select('_id name price description imageUrl rating reviewCount category stock colors colorVariants createdAt')
      .lean()
      .sort({ createdAt: -1 })
      .limit(50)
      .exec()
    
    try {
      const products = await Promise.race([dbPromise, timeoutPromise]) as any[]
      
      console.log(`[Products API] Database query completed in ${Date.now() - startTime}ms, found ${products.length} products`)
      
      // Update cache
      productsCache = products
      cacheTime = now
      
      res.json(products)
    } catch (timeoutError) {
      console.log('[Products API] Database timeout, returning mock data')
      // Return mock data if database is too slow
      res.json(mockProducts)
    }
  } catch (error) {
    console.error('[Products API] Error:', error)
    // Return mock data on any error
    console.log('[Products API] Returning mock data due to error')
    res.json(mockProducts)
  }
})

// Get single product by ID - optimized
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-__v')
      .lean()
      .exec()
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching product', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body)
    // Clear cache when creating new product
    productsCache = null
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error creating product', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    // Clear cache when updating product
    productsCache = null
    res.json(product)
  } catch (error) {
    res.status(400).json({ 
      message: 'Error updating product', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    // Clear cache when deleting product
    productsCache = null
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting product', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router
