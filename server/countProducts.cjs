// Count products in database
const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function count() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const total = await Product.countDocuments({});
    const children = await Product.countDocuments({ productType: 'child' });
    const adminAdded = await Product.countDocuments({ 
      id: { $regex: /^admin-product-/ } 
    });
    
    console.log(`Total products: ${total}`);
    console.log(`Child products: ${children}`);
    console.log(`Admin-added: ${adminAdded}`);
    
    // Show last 5 created products
    const recent = await Product.find({}).sort({ createdAt: -1 }).limit(5).lean();
    console.log('\nLast 5 created:');
    recent.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.name} (${p.id || p._id}) - ${p.productType}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

count();
