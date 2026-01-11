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

async function checkUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected');

    const email = 'zainmalik55786@gmail.com';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('✗ User not found:', email);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('\n✓ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Password:', user.password);
    console.log('  isAdmin:', user.isAdmin);
    console.log('  role:', user.role);
    console.log('  Created:', user.createdAt);

    // Update password to 123456
    console.log('\n→ Updating password to: 123456');
    user.password = '123456';
    await user.save();
    console.log('✓ Password updated successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkUser();
