const mongoose = require('mongoose');
require('dotenv').config();

// Define Product schema inline since we can't import TS files
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      default: 'Uncategorized'
    },
    stock: {
      type: Number,
      default: 0
    },
    colors: {
      type: [String],
      default: []
    },
    colorVariants: {
      type: [{
        color: String,
        name: String,
        imageUrl: String,
        price: Number
      }],
      default: []
    },
    parentId: {
      type: String,
      default: null
    },
    productType: {
      type: String,
      enum: ['parent', 'child', 'grandchild', null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', ProductSchema);

const hardcodedProducts = [
  // Parent Product - Electronics
  {
    name: 'Electronics',
    price: 0,
    description: 'Browse our complete collection of gaming and electronics accessories',
    imageUrl: '/products/a.png',
    rating: 4.5,
    reviewCount: 0,
    category: 'Electronics',
    stock: 100,
    productType: 'parent',
    parentId: null
  },
  // Child Products (shown on products page)
  {
    name: 'Cooling Fan',
    price: 49.99,
    description: 'High-performance RGB cooling fan with ultra-quiet operation and adjustable speeds for optimal airflow',
    imageUrl: '/products/c.png',
    rating: 4.6,
    reviewCount: 45,
    category: 'Electronics',
    stock: 50,
    productType: 'child',
    colors: ['#FF0000', '#00FF00', '#0000FF']
  },
  {
    name: 'Gaming Chair',
    price: 299.99,
    description: 'Ergonomic gaming chair with lumbar support, adjustable armrests, and premium leather upholstery',
    imageUrl: '/products/ch.png',
    rating: 4.8,
    reviewCount: 120,
    category: 'Electronics',
    stock: 25,
    productType: 'child',
    colors: ['#000000', '#FF0000', '#0000FF']
  },
  {
    name: 'Headphone',
    price: 149.99,
    description: 'Premium wireless headphone with active noise cancellation, 40-hour battery life, and studio-quality sound',
    imageUrl: '/products/h.png',
    rating: 4.7,
    reviewCount: 89,
    category: 'Electronics',
    stock: 60,
    productType: 'child',
    colors: ['#000000', '#FFFFFF', '#808080']
  },
  {
    name: 'Keyboard',
    price: 89.99,
    description: 'Mechanical gaming keyboard with RGB backlighting, programmable keys, and anti-ghosting technology',
    imageUrl: '/products/k.png',
    rating: 4.5,
    reviewCount: 67,
    category: 'Electronics',
    stock: 45,
    productType: 'child',
    colors: ['#000000', '#FFFFFF']
  },
  {
    name: 'Gaming Mouse',
    price: 69.99,
    description: 'Precision gaming mouse with 16,000 DPI sensor, customizable RGB lighting, and programmable buttons',
    imageUrl: '/products/m.png',
    rating: 4.6,
    reviewCount: 102,
    category: 'Electronics',
    stock: 80,
    productType: 'child',
    colors: ['#000000', '#FF0000', '#00FF00']
  },
  {
    name: 'Trigger',
    price: 39.99,
    description: 'Mobile gaming trigger with responsive buttons, ergonomic design, and universal compatibility',
    imageUrl: '/products/t.png',
    rating: 4.4,
    reviewCount: 56,
    category: 'Electronics',
    stock: 70,
    productType: 'child',
    colors: ['#000000', '#FFFFFF', '#FF0000']
  }
];

// Grandchild products for Cooling Fan
const coolingFanVariants = [
  {
    name: 'Cooling Fan - Blue LED',
    price: 49.99,
    description: 'Blue LED variant with enhanced cooling performance',
    imageUrl: '/products/c1.png',
    rating: 4.6,
    reviewCount: 15,
    category: 'Electronics',
    stock: 30,
    productType: 'grandchild'
  },
  {
    name: 'Cooling Fan - RGB Pro',
    price: 59.99,
    description: 'RGB Pro variant with customizable lighting effects',
    imageUrl: '/products/c2.png',
    rating: 4.7,
    reviewCount: 20,
    category: 'Electronics',
    stock: 25,
    productType: 'grandchild'
  },
  {
    name: 'Cooling Fan - Silent Edition',
    price: 54.99,
    description: 'Ultra-quiet operation with noise reduction technology',
    imageUrl: '/products/c3.png',
    rating: 4.8,
    reviewCount: 18,
    category: 'Electronics',
    stock: 28,
    productType: 'grandchild'
  }
];

// Grandchild products for Gaming Chair
const gamingChairVariants = [
  {
    name: 'Gaming Chair - Black Edition',
    price: 299.99,
    description: 'Classic black edition with premium leather',
    imageUrl: '/products/ch1.png',
    rating: 4.8,
    reviewCount: 40,
    category: 'Electronics',
    stock: 15,
    productType: 'grandchild'
  },
  {
    name: 'Gaming Chair - Red Racing',
    price: 329.99,
    description: 'Racing style with red accents and enhanced padding',
    imageUrl: '/products/ch2.png',
    rating: 4.9,
    reviewCount: 35,
    category: 'Electronics',
    stock: 12,
    productType: 'grandchild'
  },
  {
    name: 'Gaming Chair - Blue Pro',
    price: 319.99,
    description: 'Professional blue edition with adjustable lumbar support',
    imageUrl: '/products/ch3.png',
    rating: 4.8,
    reviewCount: 30,
    category: 'Electronics',
    stock: 18,
    productType: 'grandchild'
  }
];

// Grandchild products for Headphone
const headphoneVariants = [
  {
    name: 'Headphone - Black Wireless',
    price: 149.99,
    description: 'Wireless black edition with premium sound quality',
    imageUrl: '/products/h1.png',
    rating: 4.7,
    reviewCount: 30,
    category: 'Electronics',
    stock: 20,
    productType: 'grandchild'
  },
  {
    name: 'Headphone - White Studio',
    price: 169.99,
    description: 'Studio white edition with enhanced bass response',
    imageUrl: '/products/h2.png',
    rating: 4.8,
    reviewCount: 25,
    category: 'Electronics',
    stock: 22,
    productType: 'grandchild'
  },
  {
    name: 'Headphone - Gray Pro',
    price: 159.99,
    description: 'Professional gray edition with active noise cancellation',
    imageUrl: '/products/h3.png',
    rating: 4.7,
    reviewCount: 28,
    category: 'Electronics',
    stock: 24,
    productType: 'grandchild'
  }
];

// Grandchild products for Gaming Mouse
const gamingMouseVariants = [
  {
    name: 'Gaming Mouse - Black Ops',
    price: 69.99,
    description: 'Tactical black edition with 16,000 DPI',
    imageUrl: '/products/m1.png',
    rating: 4.6,
    reviewCount: 35,
    category: 'Electronics',
    stock: 30,
    productType: 'grandchild'
  },
  {
    name: 'Gaming Mouse - RGB Elite',
    price: 79.99,
    description: 'Elite RGB edition with customizable profiles',
    imageUrl: '/products/m2.png',
    rating: 4.7,
    reviewCount: 32,
    category: 'Electronics',
    stock: 28,
    productType: 'grandchild'
  },
  {
    name: 'Gaming Mouse - Lightweight',
    price: 74.99,
    description: 'Ultra-lightweight design for competitive gaming',
    imageUrl: '/products/m3.png',
    rating: 4.8,
    reviewCount: 38,
    category: 'Electronics',
    stock: 32,
    productType: 'grandchild'
  }
];

// Grandchild products for Trigger
const triggerVariants = [
  {
    name: 'Trigger - Standard',
    price: 39.99,
    description: 'Standard trigger with responsive buttons',
    imageUrl: '/products/t1.png',
    rating: 4.4,
    reviewCount: 20,
    category: 'Electronics',
    stock: 25,
    productType: 'grandchild'
  },
  {
    name: 'Trigger - Pro Edition',
    price: 49.99,
    description: 'Pro edition with enhanced sensitivity',
    imageUrl: '/products/t2.png',
    rating: 4.5,
    reviewCount: 18,
    category: 'Electronics',
    stock: 22,
    productType: 'grandchild'
  },
  {
    name: 'Trigger - Elite',
    price: 54.99,
    description: 'Elite edition with adjustable sensitivity settings',
    imageUrl: '/products/t3.png',
    rating: 4.6,
    reviewCount: 16,
    category: 'Electronics',
    stock: 20,
    productType: 'grandchild'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Create parent product (Electronics)
    console.log('Creating parent product...');
    const parentProduct = await Product.create(hardcodedProducts[0]);
    console.log(`✓ Created parent: ${parentProduct.name} (ID: ${parentProduct._id})`);

    // Create child products and link them to parent
    console.log('Creating child products...');
    const childProducts = [];
    for (let i = 1; i < hardcodedProducts.length; i++) {
      const childData = {
        ...hardcodedProducts[i],
        parentId: parentProduct._id.toString()
      };
      const child = await Product.create(childData);
      childProducts.push(child);
      console.log(`✓ Created child: ${child.name} (ID: ${child._id})`);
    }

    // Create grandchild products
    console.log('Creating grandchild products...');
    
    // Cooling Fan variants
    const coolingFanParent = childProducts.find(p => p.name === 'Cooling Fan');
    for (const variant of coolingFanVariants) {
      const grandchild = await Product.create({
        ...variant,
        parentId: coolingFanParent._id.toString()
      });
      console.log(`✓ Created grandchild: ${grandchild.name}`);
    }

    // Gaming Chair variants
    const gamingChairParent = childProducts.find(p => p.name === 'Gaming Chair');
    for (const variant of gamingChairVariants) {
      const grandchild = await Product.create({
        ...variant,
        parentId: gamingChairParent._id.toString()
      });
      console.log(`✓ Created grandchild: ${grandchild.name}`);
    }

    // Headphone variants
    const headphoneParent = childProducts.find(p => p.name === 'Headphone');
    for (const variant of headphoneVariants) {
      const grandchild = await Product.create({
        ...variant,
        parentId: headphoneParent._id.toString()
      });
      console.log(`✓ Created grandchild: ${grandchild.name}`);
    }

    // Gaming Mouse variants
    const gamingMouseParent = childProducts.find(p => p.name === 'Gaming Mouse');
    for (const variant of gamingMouseVariants) {
      const grandchild = await Product.create({
        ...variant,
        parentId: gamingMouseParent._id.toString()
      });
      console.log(`✓ Created grandchild: ${grandchild.name}`);
    }

    // Trigger variants
    const triggerParent = childProducts.find(p => p.name === 'Trigger');
    for (const variant of triggerVariants) {
      const grandchild = await Product.create({
        ...variant,
        parentId: triggerParent._id.toString()
      });
      console.log(`✓ Created grandchild: ${grandchild.name}`);
    }

    // Count products
    const totalProducts = await Product.countDocuments();
    const parentCount = await Product.countDocuments({ productType: 'parent' });
    const childCount = await Product.countDocuments({ productType: 'child' });
    const grandchildCount = await Product.countDocuments({ productType: 'grandchild' });

    console.log('\n========================================');
    console.log('Seeding completed successfully!');
    console.log(`Total products: ${totalProducts}`);
    console.log(`├─ Parents: ${parentCount}`);
    console.log(`├─ Children: ${childCount}`);
    console.log(`└─ Grandchildren: ${grandchildCount}`);
    console.log('========================================\n');

    // Seed slider images
    console.log('Creating slider images...');
    const AdminSettings = mongoose.model('AdminSettings', new mongoose.Schema({
      key: String,
      value: mongoose.Schema.Types.Mixed,
      updatedAt: Date
    }));

    const defaultSlides = [
      {
        id: '1',
        title: 'Premium Gaming Gear',
        description: 'Experience top-tier performance with our elite gaming collection',
        imageUrl: '/products/s1.png',
        buttonText: 'Shop Now',
        linkTo: '/products',
        order: 0
      },
      {
        id: '2',
        title: 'Ultimate Comfort',
        description: 'Ergonomic designs for marathon gaming sessions',
        imageUrl: '/products/s2.png',
        buttonText: 'Explore',
        linkTo: '/products',
        order: 1
      },
      {
        id: '3',
        title: 'Precision & Style',
        description: 'RGB lighting meets professional-grade performance',
        imageUrl: '/products/s3.png',
        buttonText: 'Discover',
        linkTo: '/products',
        order: 2
      }
    ];

    await AdminSettings.findOneAndUpdate(
      { key: 'heroSlides' },
      { key: 'heroSlides', value: defaultSlides, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log('✓ Created slider images');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
