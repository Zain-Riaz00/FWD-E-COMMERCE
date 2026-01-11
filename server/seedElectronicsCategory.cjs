const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  description: String,
  color: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Category = mongoose.model('Category', categorySchema)

async function seedElectronicsCategory() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    // Check if Electronics category already exists
    const existing = await Category.findOne({ name: 'Electronics' })
    
    if (existing) {
      console.log('Electronics category already exists with ID:', existing.id || existing._id)
      console.log('Category data:', existing)
    } else {
      // Create Electronics category
      const electronicsCategory = await Category.create({
        id: 'electronics',
        name: 'Electronics',
        description: 'Gaming and electronics accessories including cooling fans, keyboards, mice, headphones, and more',
        color: '#06b6d4', // Cyan color
        imageUrl: '/products/a.png'
      })
      
      console.log('✓ Created Electronics category')
      console.log('Category ID:', electronicsCategory.id)
      console.log('Category _id:', electronicsCategory._id)
    }

    await mongoose.disconnect()
    console.log('✓ Done')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

seedElectronicsCategory()
