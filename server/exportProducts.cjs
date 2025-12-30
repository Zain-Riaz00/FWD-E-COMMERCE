// Script to manually copy products from MongoDB to a JSON file
// This bypasses the query hang issue
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function exportProducts() {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✓ Connected\n');
    
    const db = mongoose.connection.db;
    console.log('Fetching products...');
    
    // Try different approach - find with limit
    const products = [];
    let cursor = db.collection('products').find({});
    
    let count = 0;
    await cursor.forEach(doc => {
      products.push(doc);
      count++;
      if (count % 5 === 0) console.log(`  Loaded ${count} products...`);
    });
    
    console.log(`\n✓ Got ${products.length} products`);
    
    // Write to file
    const output = JSON.stringify(products, null, 2);
    fs.writeFileSync('products_backup.json', output);
    console.log('✓ Saved to products_backup.json');
    
    await mongoose.disconnect();
    console.log('✓ Done');
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

exportProducts();
