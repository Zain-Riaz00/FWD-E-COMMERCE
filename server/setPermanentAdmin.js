import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  isPermanentAdmin: Boolean,
  isVerified: Boolean,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

const setPermanentAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://zainkhann786:hF5SepEyGxuPpC1h@ecomcluster.4fmcf.mongodb.net/?retryWrites=true&w=majority&appName=EcomCluster';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all admins
    const admins = await User.find({ isAdmin: true });
    console.log(`Found ${admins.length} admins:`);
    admins.forEach((admin, i) => {
      console.log(`${i + 1}. ${admin.email} - ${admin.name} (isPermanentAdmin: ${admin.isPermanentAdmin || false})`);
    });

    // Check if there's already a permanent admin
    const existingPermanent = await User.findOne({ isPermanentAdmin: true });
    if (existingPermanent) {
      console.log(`\nPermanent admin already exists: ${existingPermanent.email}`);
    } else if (admins.length > 0) {
      // Set the first admin as permanent
      const firstAdmin = admins[0];
      firstAdmin.isPermanentAdmin = true;
      await firstAdmin.save();
      console.log(`\n✓ Set ${firstAdmin.email} as permanent admin`);
    } else {
      console.log('\nNo admins found in database');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

setPermanentAdmin();
