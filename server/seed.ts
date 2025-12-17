import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product'
import User from './models/User'

dotenv.config()

const sampleProducts = [
  {
    name: 'Ultra Mechanical Keyboard',
    price: 149.99,
    description: 'A premium hot-swappable mechanical keyboard with PBT keycaps and gasket mount for a soft, satisfying typing feel.',
    imageUrl: 'https://picsum.photos/seed/product-1/800/800',
    rating: 4.5,
    reviewCount: 42,
    category: 'Electronics',
    stock: 25,
    colors: ['#000000', '#FFFFFF', '#1E40AF']
  },
  {
    name: 'Wireless Gaming Mouse',
    price: 79.99,
    description: 'Ergonomic wireless gaming mouse with customizable RGB lighting and high-precision sensor.',
    imageUrl: 'https://picsum.photos/seed/product-2/800/800',
    rating: 4.7,
    reviewCount: 88,
    category: 'Electronics',
    stock: 40,
    colors: ['#000000', '#EF4444', '#3B82F6']
  },
  {
    name: 'Premium Headphones',
    price: 299.99,
    description: 'Studio-quality over-ear headphones with active noise cancellation and 30-hour battery life.',
    imageUrl: 'https://picsum.photos/seed/product-3/800/800',
    rating: 4.8,
    reviewCount: 156,
    category: 'Electronics',
    stock: 15,
    colors: ['#000000', '#FFFFFF', '#6366F1']
  },
  {
    name: 'Smart Watch Pro',
    price: 399.99,
    description: 'Advanced fitness tracking with heart rate monitoring, GPS, and customizable watch faces.',
    imageUrl: 'https://picsum.photos/seed/product-4/800/800',
    rating: 4.6,
    reviewCount: 203,
    category: 'Wearables',
    stock: 30,
    colors: ['#000000', '#6B7280', '#10B981']
  },
  {
    name: 'Laptop Stand',
    price: 49.99,
    description: 'Adjustable aluminum laptop stand with ergonomic design for better posture.',
    imageUrl: 'https://picsum.photos/seed/product-5/800/800',
    rating: 4.3,
    reviewCount: 67,
    category: 'Accessories',
    stock: 50,
    colors: ['#6B7280', '#FFFFFF']
  },
  {
    name: 'Webcam 4K Pro',
    price: 129.99,
    description: 'Ultra HD 4K webcam with auto-focus and low-light correction for professional streaming.',
    imageUrl: 'https://picsum.photos/seed/product-6/800/800',
    rating: 4.4,
    reviewCount: 93,
    category: 'Electronics',
    stock: 35,
    colors: ['#000000']
  },
  {
    name: 'USB-C Hub',
    price: 59.99,
    description: '7-in-1 USB-C hub with HDMI, SD card readers, and high-speed data transfer ports.',
    imageUrl: 'https://picsum.photos/seed/product-7/800/800',
    rating: 4.5,
    reviewCount: 128,
    category: 'Accessories',
    stock: 60,
    colors: ['#6B7280', '#000000']
  },
  {
    name: 'Portable SSD 1TB',
    price: 179.99,
    description: 'Ultra-fast portable SSD with 1TB storage and USB 3.2 Gen 2 connectivity.',
    imageUrl: 'https://picsum.photos/seed/product-8/800/800',
    rating: 4.9,
    reviewCount: 245,
    category: 'Storage',
    stock: 22,
    colors: ['#000000', '#3B82F6']
  }
]

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false
  }
]

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('MongoDB Connected')

    // Clear existing data
    await Product.deleteMany({})
    await User.deleteMany({})
    console.log('Cleared existing data')

    // Insert sample data
    await Product.insertMany(sampleProducts)
    console.log('Sample products inserted')

    await User.insertMany(sampleUsers)
    console.log('Sample users inserted')

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
