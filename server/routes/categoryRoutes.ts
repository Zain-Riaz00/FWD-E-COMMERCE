import express from 'express'
import Category from '../models/Category'

const router = express.Router()

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error })
  }
})

// Create category
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body)
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error })
  }
})

// Update category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.json(category)
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error })
  }
})

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error })
  }
})

// Bulk save categories (for migration from localStorage)
router.post('/bulk', async (req, res) => {
  try {
    const categories = req.body.categories
    const result = await Category.insertMany(categories, { ordered: false })
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: 'Error bulk saving categories', error })
  }
})

export default router
