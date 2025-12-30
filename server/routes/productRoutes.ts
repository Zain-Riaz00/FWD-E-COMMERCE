import { Router, Request, Response } from 'express'
import Product from '../models/Product'

const router = Router()

// GET all products - simple and fast
router.get('/', async (req: Request, res: Response) => {
  console.log('[Products] GET all')
  try {
    const products = await Product.find({}).lean()
    console.log(`[Products] Found ${products.length} products`)
    res.json(products)
  } catch (error) {
    console.error('[Products] Error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error('[Products] Error:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST create product
router.post('/', async (req: Request, res: Response) => {
  console.log('[Products] Creating product...')
  console.log('[Products] Request body:', JSON.stringify(req.body, null, 2))
  try {
    // Remove id field if present (MongoDB will generate _id)
    const { id, _id, ...productData } = req.body
    
    console.log('[Products] Product data to save:', JSON.stringify(productData, null, 2))
    const product = new Product(productData)
    const saved = await product.save()
    console.log('[Products] Created:', saved._id)
    console.log('[Products] Saved product:', JSON.stringify(saved, null, 2))
    res.status(201).json(saved)
  } catch (error) {
    console.error('[Products] Create error:', error)
    res.status(400).json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// PUT update product
router.put('/:id', async (req: Request, res: Response) => {
  console.log('[Products] Updating:', req.params.id)
  console.log('[Products] Update body:', JSON.stringify(req.body, null, 2))
  try {
    const { id, _id, ...updateData } = req.body
    
    console.log('[Products] Update data:', JSON.stringify(updateData, null, 2))
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    console.log('[Products] Updated:', product._id)
    console.log('[Products] Updated product:', JSON.stringify(product, null, 2))
    res.json(product)
  } catch (error) {
    console.error('[Products] Update error:', error)
    res.status(400).json({ error: 'Failed to update product' })
  }
})

// DELETE product
router.delete('/:id', async (req: Request, res: Response) => {
  console.log('[Products] Deleting:', req.params.id)
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    console.log('[Products] Deleted:', req.params.id)
    res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('[Products] Delete error:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
