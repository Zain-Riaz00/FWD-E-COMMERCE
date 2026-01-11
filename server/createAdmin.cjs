const mongoose = require('mongoose');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected');

    const adminEmail = 'zainmalik55786@gmail.com';
    
    // Check if admin exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('✓ Admin user already exists:', adminEmail);
      console.log('  Name:', existing.name);
      console.log('  isAdmin:', existing.isAdmin);
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Zain Malik',
      email: adminEmail,
      password: '123456', // Change this to your desired password
      isAdmin: true,
      role: 'admin'
    });

    await admin.save();
    console.log('✓ Admin user created successfully!');
    console.log('  Email:', adminEmail);
    console.log('  Password: 123456');
    console.log('  You can now login with these credentials');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
