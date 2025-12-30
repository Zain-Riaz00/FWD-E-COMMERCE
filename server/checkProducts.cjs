const mongoose = require('mongoose');
require('dotenv').config();

// Product Schema (same as in server)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  category: { type: String, default: 'Uncategorized' },
  stock: { type: Number, default: 0 },
  colors: [String],
  colorVariants: { type: Array, default: [] }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected!\n');

    // Get all products
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    console.log('========================================');
    console.log(`TOTAL PRODUCTS IN DATABASE: ${products.length}`);
    console.log('========================================\n');

    if (products.length === 0) {
      console.log('⚠️  NO PRODUCTS FOUND IN DATABASE!');
      console.log('This explains why your old products disappeared.\n');
    } else {
      console.log('Products in database:\n');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Price: $${product.price}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Stock: ${product.stock}`);
        console.log(`   Created: ${product.createdAt}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProducts();
