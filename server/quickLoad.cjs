const { MongoClient } = require('mongodb');
require('dotenv').config();

async function quickLoad() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    maxPoolSize: 1
  });

  try {
    console.log('Quick connecting...');
    await client.connect();
    console.log('✓ Connected');
    
    const db = client.db('ecom-fwd');
    const collection = db.collection('products');
    
    console.log('Fetching products with 3s timeout...');
    const products = await collection.find({})
      .maxTimeMS(3000)
      .limit(100)
      .toArray();
    
    console.log(`✓ Got ${products.length} products`);
    console.log(JSON.stringify(products, null, 2));
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

quickLoad();
