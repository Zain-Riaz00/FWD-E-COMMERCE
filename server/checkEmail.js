import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const checkEmail = async () => {
  try {
    const mongoUri = 'mongodb+srv://zainkhann786:hF5SepEyGxuPpC1h@ecomcluster.4fmcf.mongodb.net/ecom-fwd?retryWrites=true&w=majority&appName=EcomCluster';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'zainmalik55786@gmail.com' });
    if (user) {
      console.log('\nFound user with email zainmalik55786@gmail.com:');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('isAdmin:', user.isAdmin);
      console.log('isPermanentAdmin:', user.isPermanentAdmin);
      
      // Delete this user if not an admin
      if (!user.isAdmin) {
        await User.findByIdAndDelete(user._id);
        console.log('\n✓ Deleted non-admin user with this email');
      }
    } else {
      console.log('\nNo user found with email zainmalik55786@gmail.com');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkEmail();
