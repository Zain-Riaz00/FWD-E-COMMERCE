const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isPermanentAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected');

    const email = 'zainmalik55786@gmail.com';
    const newPassword = '123456';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('✗ User not found. Creating admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const newUser = new User({
        name: 'Zain Malik',
        email: email,
        password: hashedPassword,
        isAdmin: true,
        isPermanentAdmin: true,
        role: 'admin'
      });
      
      await newUser.save();
      console.log('✓ Admin user created!');
    } else {
      console.log('✓ User found:', email);
      
      // Hash new password
      console.log('→ Hashing new password with bcrypt...');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user
      user.password = hashedPassword;
      user.isAdmin = true;
      user.isPermanentAdmin = true;
      await user.save();
      
      console.log('✓ Password updated successfully!');
    }
    
    console.log('\n✓ LOGIN CREDENTIALS:');
    console.log('  Email:', email);
    console.log('  Password:', newPassword);
    console.log('\nYou can now login!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

resetPassword();
