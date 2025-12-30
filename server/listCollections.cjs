const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✓ Connected\n');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections:`);
    for (const col of collections) {
      console.log(`\n📦 ${col.name}`);
      const count = await db.collection(col.name).countDocuments();
      console.log(`   Documents: ${count}`);
      
      if (count > 0 && count < 20) {
        const sample = await db.collection(col.name).find({}).limit(3).toArray();
        console.log(`   Sample docs:`, sample.map(d => d.name || d.email || d._id.toString()).join(', '));
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✓ Done');
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

listCollections();
