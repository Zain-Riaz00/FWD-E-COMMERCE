const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  color: String,
  imageUrl: String
})

const Category = mongoose.model('Category', categorySchema)

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    const categories = await Category.find({})
    console.log(`\nFound ${categories.length} categories:`)
    categories.forEach(cat => {
      console.log(`- ${cat.name} (id: ${cat.id || cat._id})`)
    })
    
    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkCategories()
