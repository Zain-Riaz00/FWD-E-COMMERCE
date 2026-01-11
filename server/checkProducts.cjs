// Quick script to check products in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imageUrl: String,
  category: String,
  stock: Number,
  productType: String,
  parentId: String,
}, { 
  timestamps: true,
  collection: 'products'
});

const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected\n');
    
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products in database:\n`);
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p.id || 'none'}`);
      console.log(`   _ID: ${p._id}`);
      console.log(`   Type: ${p.productType || 'none'}`);
      console.log(`   Price: $${p.price}`);
      console.log(`   Created: ${p.createdAt}\n`);
    });
    
    // Count by type
    const parentCount = products.filter(p => p.productType === 'parent').length;
    const childCount = products.filter(p => p.productType === 'child').length;
    const grandchildCount = products.filter(p => p.productType === 'grandchild').length;
    const noTypeCount = products.filter(p => !p.productType).length;
    
    console.log('\nSummary:');
    console.log(`  Parent: ${parentCount}`);
    console.log(`  Child: ${childCount}`);
    console.log(`  Grandchild: ${grandchildCount}`);
    console.log(`  No type: ${noTypeCount}`);
    console.log(`  Total: ${products.length}`);
    
    await mongoose.disconnect();
    console.log('\n✓ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();
