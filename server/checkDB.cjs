const mongoose = require('mongoose');
require('dotenv').config();

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
  colorVariants: { type: Array, default: [] },
  parentId: { type: String, default: null },
  productType: { type: String, enum: ['parent', 'child', 'grandchild', null], default: null }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function checkDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ Connected');
    
    console.log('\nCounting products...');
    const count = await Product.countDocuments();
    console.log(`Total products: ${count}`);
    
    if (count > 0) {
      console.log('\nFetching all products...');
      const products = await Product.find({}).lean();
      
      console.log(`\nProducts found: ${products.length}`);
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.category}) - Type: ${p.productType || 'none'} - Parent: ${p.parentId || 'none'}`);
      });
      
      // Check by category
      const electronics = products.filter(p => p.category === 'Electronics');
      console.log(`\n📱 Electronics products: ${electronics.length}`);
      electronics.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p._id})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✓ Disconnected');
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkDB();
