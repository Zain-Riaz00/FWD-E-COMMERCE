// Local product data for instant loading without server
// Images are stored in /products folder with naming convention:
// - Main product image: letter.png (e.g., c.png, h.png, m.png)
// - Color variants: letter + number.png (e.g., c1.png, c2.png - different colors of product c)

import type { Product } from '@/types/product'

// Parent Product
const parentProduct: Product = {
  id: 'local-parent-electronics',
  name: 'Electronics',
  price: 0,
  description: 'Browse our complete collection of gaming and electronics accessories',
  imageUrl: '/products/a.png',
  rating: 4.5,
  reviewCount: 0,
  category: 'electronics',
  stock: 100,
  productType: 'parent',
  parentId: undefined
}

// Child Products (shown on products page) - these are the main products
export const childProducts: Product[] = [
  {
    id: 'local-cooling-fan',
    name: 'Cooling Fan',
    price: 49.99,
    description: 'High-performance RGB cooling fan with ultra-quiet operation and adjustable speeds for optimal airflow',
    imageUrl: '/products/c.png',
    rating: 4.6,
    reviewCount: 45,
    category: 'electronics',
    stock: 50,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    colorVariants: [
      { name: 'Blue LED', color: '#0000FF', imageUrl: '/products/c1.png', price: 49.99 },
      { name: 'RGB Pro', color: '#FF00FF', imageUrl: '/products/c2.png', price: 59.99 },
      { name: 'Silent Edition', color: '#808080', imageUrl: '/products/c3.png', price: 54.99 }
    ]
  },
  {
    id: 'local-gaming-chair',
    name: 'Gaming Chair',
    price: 299.99,
    description: 'Ergonomic gaming chair with lumbar support, adjustable armrests, and premium leather upholstery',
    imageUrl: '/products/ch.png',
    rating: 4.8,
    reviewCount: 120,
    category: 'electronics',
    stock: 25,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FF0000', '#0000FF'],
    colorVariants: [
      { name: 'Black Edition', color: '#000000', imageUrl: '/products/ch1.png', price: 299.99 },
      { name: 'Red Racing', color: '#FF0000', imageUrl: '/products/ch2.png', price: 329.99 },
      { name: 'Blue Pro', color: '#0000FF', imageUrl: '/products/ch3.png', price: 319.99 },
      { name: 'White Elite', color: '#FFFFFF', imageUrl: '/products/ch4.png', price: 339.99 }
    ]
  },
  {
    id: 'local-headphone',
    name: 'Headphone',
    price: 149.99,
    description: 'Premium wireless headphone with active noise cancellation, 40-hour battery life, and studio-quality sound',
    imageUrl: '/products/h.png',
    rating: 4.7,
    reviewCount: 89,
    category: 'electronics',
    stock: 60,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FFFFFF', '#808080'],
    colorVariants: [
      { name: 'Black Wireless', color: '#000000', imageUrl: '/products/h1.png', price: 149.99 },
      { name: 'White Studio', color: '#FFFFFF', imageUrl: '/products/h2.png', price: 169.99 },
      { name: 'Gray Pro', color: '#808080', imageUrl: '/products/h3.png', price: 159.99 },
      { name: 'Blue Edition', color: '#0066CC', imageUrl: '/products/h4.png', price: 159.99 }
    ]
  },
  {
    id: 'local-keyboard',
    name: 'Keyboard',
    price: 89.99,
    description: 'Mechanical gaming keyboard with RGB backlighting, programmable keys, and anti-ghosting technology',
    imageUrl: '/products/k.png',
    rating: 4.5,
    reviewCount: 67,
    category: 'electronics',
    stock: 45,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FFFFFF']
  },
  {
    id: 'local-gaming-mouse',
    name: 'Gaming Mouse',
    price: 69.99,
    description: 'Precision gaming mouse with 16,000 DPI sensor, customizable RGB lighting, and programmable buttons',
    imageUrl: '/products/m.png',
    rating: 4.6,
    reviewCount: 102,
    category: 'electronics',
    stock: 80,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FF0000', '#00FF00'],
    colorVariants: [
      { name: 'Black Ops', color: '#000000', imageUrl: '/products/m1.png', price: 69.99 },
      { name: 'RGB Elite', color: '#FF00FF', imageUrl: '/products/m2.png', price: 79.99 },
      { name: 'Lightweight', color: '#FFFFFF', imageUrl: '/products/m3.png', price: 74.99 },
      { name: 'Pro Edition', color: '#00FF00', imageUrl: '/products/m4.png', price: 84.99 }
    ]
  },
  {
    id: 'local-trigger',
    name: 'Trigger',
    price: 39.99,
    description: 'Mobile gaming trigger with responsive buttons, ergonomic design, and universal compatibility',
    imageUrl: '/products/t.png',
    rating: 4.4,
    reviewCount: 56,
    category: 'electronics',
    stock: 70,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FFFFFF', '#FF0000'],
    colorVariants: [
      { name: 'Standard', color: '#000000', imageUrl: '/products/t1.png', price: 39.99 },
      { name: 'Pro Edition', color: '#FFFFFF', imageUrl: '/products/t2.png', price: 49.99 },
      { name: 'Elite', color: '#FF0000', imageUrl: '/products/t3.png', price: 54.99 },
      { name: 'Ultimate', color: '#FFD700', imageUrl: '/products/t4.png', price: 59.99 }
    ]
  },
  {
    id: 'local-gaming-gear-g',
    name: 'Gaming Gear Set',
    price: 129.99,
    description: 'Complete gaming gear set with premium accessories for competitive gaming',
    imageUrl: '/products/g1.png',
    rating: 4.7,
    reviewCount: 78,
    category: 'electronics',
    stock: 35,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FF0000', '#0000FF', '#00FF00'],
    colorVariants: [
      { name: 'Black Pro', color: '#000000', imageUrl: '/products/g1.png', price: 129.99 },
      { name: 'Red Elite', color: '#FF0000', imageUrl: '/products/g2.png', price: 139.99 },
      { name: 'Blue Gaming', color: '#0000FF', imageUrl: '/products/g3.png', price: 134.99 },
      { name: 'Green Neon', color: '#00FF00', imageUrl: '/products/g4.png', price: 134.99 }
    ]
  },
  {
    id: 'local-microphone',
    name: 'Gaming Microphone',
    price: 79.99,
    description: 'Professional USB condenser microphone with cardioid pattern, perfect for streaming and gaming',
    imageUrl: '/products/mic1.png',
    rating: 4.5,
    reviewCount: 63,
    category: 'electronics',
    stock: 40,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
    colorVariants: [
      { name: 'Black Studio', color: '#000000', imageUrl: '/products/mic1.png', price: 79.99 },
      { name: 'White Clean', color: '#FFFFFF', imageUrl: '/products/mic2.png', price: 79.99 },
      { name: 'Red Stream', color: '#FF0000', imageUrl: '/products/mic3.png', price: 89.99 },
      { name: 'Blue Podcast', color: '#0000FF', imageUrl: '/products/mic4.png', price: 89.99 }
    ]
  },
  {
    id: 'local-controller-p',
    name: 'Gaming Controller',
    price: 59.99,
    description: 'Wireless gaming controller with ergonomic grip, vibration feedback, and long battery life',
    imageUrl: '/products/p1.png',
    rating: 4.6,
    reviewCount: 95,
    category: 'electronics',
    stock: 55,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
    colorVariants: [
      { name: 'Black Classic', color: '#000000', imageUrl: '/products/p1.png', price: 59.99 },
      { name: 'White Pure', color: '#FFFFFF', imageUrl: '/products/p2.png', price: 59.99 },
      { name: 'Red Fire', color: '#FF0000', imageUrl: '/products/p3.png', price: 64.99 },
      { name: 'Blue Ocean', color: '#0000FF', imageUrl: '/products/p4.png', price: 64.99 }
    ]
  },
  {
    id: 'local-rgb-light-r',
    name: 'RGB Light Strip',
    price: 29.99,
    description: 'Flexible RGB LED light strip with remote control, multiple modes, and easy installation',
    imageUrl: '/products/r1.png',
    rating: 4.3,
    reviewCount: 42,
    category: 'electronics',
    stock: 90,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    colorVariants: [
      { name: 'Standard 2M', color: '#FF0000', imageUrl: '/products/r1.png', price: 29.99 },
      { name: 'Extended 5M', color: '#00FF00', imageUrl: '/products/r2.png', price: 49.99 },
      { name: 'Pro 10M', color: '#0000FF', imageUrl: '/products/r3.png', price: 69.99 }
    ]
  },
  {
    id: 'local-usb-hub-u',
    name: 'USB Hub',
    price: 34.99,
    description: 'High-speed USB 3.0 hub with 7 ports, LED indicators, and compact design',
    imageUrl: '/products/u1.png',
    rating: 4.4,
    reviewCount: 38,
    category: 'electronics',
    stock: 75,
    productType: 'child',
    parentId: 'local-parent-electronics',
    colors: ['#000000', '#FFFFFF', '#808080', '#0000FF'],
    colorVariants: [
      { name: 'Black Compact', color: '#000000', imageUrl: '/products/u1.png', price: 34.99 },
      { name: 'White Slim', color: '#FFFFFF', imageUrl: '/products/u2.png', price: 34.99 },
      { name: 'Gray Pro', color: '#808080', imageUrl: '/products/u3.png', price: 39.99 },
      { name: 'Blue Glow', color: '#0000FF', imageUrl: '/products/u4.png', price: 39.99 }
    ]
  }
]

// Grandchild Products (color variants that are separate products)
export const grandchildProducts: Product[] = [
  // Cooling Fan variants
  {
    id: 'local-cooling-fan-c1',
    name: 'Cooling Fan - Blue LED',
    price: 49.99,
    description: 'Blue LED variant with enhanced cooling performance',
    imageUrl: '/products/c1.png',
    rating: 4.6,
    reviewCount: 15,
    category: 'electronics',
    stock: 30,
    productType: 'grandchild',
    parentId: 'local-cooling-fan'
  },
  {
    id: 'local-cooling-fan-c2',
    name: 'Cooling Fan - RGB Pro',
    price: 59.99,
    description: 'RGB Pro variant with customizable lighting effects',
    imageUrl: '/products/c2.png',
    rating: 4.7,
    reviewCount: 20,
    category: 'electronics',
    stock: 25,
    productType: 'grandchild',
    parentId: 'local-cooling-fan'
  },
  {
    id: 'local-cooling-fan-c3',
    name: 'Cooling Fan - Silent Edition',
    price: 54.99,
    description: 'Ultra-quiet operation with noise reduction technology',
    imageUrl: '/products/c3.png',
    rating: 4.8,
    reviewCount: 18,
    category: 'electronics',
    stock: 28,
    productType: 'grandchild',
    parentId: 'local-cooling-fan'
  },
  // Gaming Chair variants
  {
    id: 'local-gaming-chair-ch1',
    name: 'Gaming Chair - Black Edition',
    price: 299.99,
    description: 'Classic black edition with premium leather',
    imageUrl: '/products/ch1.png',
    rating: 4.8,
    reviewCount: 40,
    category: 'electronics',
    stock: 15,
    productType: 'grandchild',
    parentId: 'local-gaming-chair'
  },
  {
    id: 'local-gaming-chair-ch2',
    name: 'Gaming Chair - Red Racing',
    price: 329.99,
    description: 'Racing style with red accents and enhanced padding',
    imageUrl: '/products/ch2.png',
    rating: 4.9,
    reviewCount: 35,
    category: 'electronics',
    stock: 12,
    productType: 'grandchild',
    parentId: 'local-gaming-chair'
  },
  {
    id: 'local-gaming-chair-ch3',
    name: 'Gaming Chair - Blue Pro',
    price: 319.99,
    description: 'Professional blue edition with adjustable lumbar support',
    imageUrl: '/products/ch3.png',
    rating: 4.8,
    reviewCount: 30,
    category: 'electronics',
    stock: 18,
    productType: 'grandchild',
    parentId: 'local-gaming-chair'
  },
  {
    id: 'local-gaming-chair-ch4',
    name: 'Gaming Chair - White Elite',
    price: 339.99,
    description: 'Premium white elite edition with top-tier comfort',
    imageUrl: '/products/ch4.png',
    rating: 4.9,
    reviewCount: 28,
    category: 'electronics',
    stock: 10,
    productType: 'grandchild',
    parentId: 'local-gaming-chair'
  },
  // Headphone variants
  {
    id: 'local-headphone-h1',
    name: 'Headphone - Black Wireless',
    price: 149.99,
    description: 'Wireless black edition with premium sound quality',
    imageUrl: '/products/h1.png',
    rating: 4.7,
    reviewCount: 30,
    category: 'electronics',
    stock: 20,
    productType: 'grandchild',
    parentId: 'local-headphone'
  },
  {
    id: 'local-headphone-h2',
    name: 'Headphone - White Studio',
    price: 169.99,
    description: 'Studio white edition with enhanced bass response',
    imageUrl: '/products/h2.png',
    rating: 4.8,
    reviewCount: 25,
    category: 'electronics',
    stock: 22,
    productType: 'grandchild',
    parentId: 'local-headphone'
  },
  {
    id: 'local-headphone-h3',
    name: 'Headphone - Gray Pro',
    price: 159.99,
    description: 'Professional gray edition with active noise cancellation',
    imageUrl: '/products/h3.png',
    rating: 4.7,
    reviewCount: 28,
    category: 'electronics',
    stock: 24,
    productType: 'grandchild',
    parentId: 'local-headphone'
  },
  {
    id: 'local-headphone-h4',
    name: 'Headphone - Blue Edition',
    price: 159.99,
    description: 'Stylish blue edition with premium audio drivers',
    imageUrl: '/products/h4.png',
    rating: 4.6,
    reviewCount: 22,
    category: 'electronics',
    stock: 26,
    productType: 'grandchild',
    parentId: 'local-headphone'
  },
  // Gaming Mouse variants
  {
    id: 'local-gaming-mouse-m1',
    name: 'Gaming Mouse - Black Ops',
    price: 69.99,
    description: 'Tactical black edition with 16,000 DPI',
    imageUrl: '/products/m1.png',
    rating: 4.6,
    reviewCount: 35,
    category: 'electronics',
    stock: 30,
    productType: 'grandchild',
    parentId: 'local-gaming-mouse'
  },
  {
    id: 'local-gaming-mouse-m2',
    name: 'Gaming Mouse - RGB Elite',
    price: 79.99,
    description: 'Elite RGB edition with customizable profiles',
    imageUrl: '/products/m2.png',
    rating: 4.7,
    reviewCount: 32,
    category: 'electronics',
    stock: 28,
    productType: 'grandchild',
    parentId: 'local-gaming-mouse'
  },
  {
    id: 'local-gaming-mouse-m3',
    name: 'Gaming Mouse - Lightweight',
    price: 74.99,
    description: 'Ultra-lightweight design for competitive gaming',
    imageUrl: '/products/m3.png',
    rating: 4.8,
    reviewCount: 38,
    category: 'electronics',
    stock: 32,
    productType: 'grandchild',
    parentId: 'local-gaming-mouse'
  },
  {
    id: 'local-gaming-mouse-m4',
    name: 'Gaming Mouse - Pro Edition',
    price: 84.99,
    description: 'Professional edition with advanced sensor technology',
    imageUrl: '/products/m4.png',
    rating: 4.9,
    reviewCount: 40,
    category: 'electronics',
    stock: 25,
    productType: 'grandchild',
    parentId: 'local-gaming-mouse'
  },
  // Trigger variants
  {
    id: 'local-trigger-t1',
    name: 'Trigger - Standard',
    price: 39.99,
    description: 'Standard trigger with responsive buttons',
    imageUrl: '/products/t1.png',
    rating: 4.4,
    reviewCount: 20,
    category: 'electronics',
    stock: 25,
    productType: 'grandchild',
    parentId: 'local-trigger'
  },
  {
    id: 'local-trigger-t2',
    name: 'Trigger - Pro Edition',
    price: 49.99,
    description: 'Pro edition with enhanced sensitivity',
    imageUrl: '/products/t2.png',
    rating: 4.5,
    reviewCount: 18,
    category: 'electronics',
    stock: 22,
    productType: 'grandchild',
    parentId: 'local-trigger'
  },
  {
    id: 'local-trigger-t3',
    name: 'Trigger - Elite',
    price: 54.99,
    description: 'Elite edition with adjustable sensitivity settings',
    imageUrl: '/products/t3.png',
    rating: 4.6,
    reviewCount: 16,
    category: 'electronics',
    stock: 20,
    productType: 'grandchild',
    parentId: 'local-trigger'
  },
  {
    id: 'local-trigger-t4',
    name: 'Trigger - Ultimate',
    price: 59.99,
    description: 'Ultimate edition with premium build quality',
    imageUrl: '/products/t4.png',
    rating: 4.7,
    reviewCount: 14,
    category: 'electronics',
    stock: 18,
    productType: 'grandchild',
    parentId: 'local-trigger'
  },
  // Gaming Gear Set variants
  {
    id: 'local-gaming-gear-g1',
    name: 'Gaming Gear Set - Black Pro',
    price: 129.99,
    description: 'Complete black pro gaming set',
    imageUrl: '/products/g1.png',
    rating: 4.7,
    reviewCount: 25,
    category: 'electronics',
    stock: 15,
    productType: 'grandchild',
    parentId: 'local-gaming-gear-g'
  },
  {
    id: 'local-gaming-gear-g2',
    name: 'Gaming Gear Set - Red Elite',
    price: 139.99,
    description: 'Elite red edition gaming set',
    imageUrl: '/products/g2.png',
    rating: 4.8,
    reviewCount: 22,
    category: 'electronics',
    stock: 12,
    productType: 'grandchild',
    parentId: 'local-gaming-gear-g'
  },
  {
    id: 'local-gaming-gear-g3',
    name: 'Gaming Gear Set - Blue Gaming',
    price: 134.99,
    description: 'Blue gaming edition with RGB',
    imageUrl: '/products/g3.png',
    rating: 4.7,
    reviewCount: 20,
    category: 'electronics',
    stock: 14,
    productType: 'grandchild',
    parentId: 'local-gaming-gear-g'
  },
  {
    id: 'local-gaming-gear-g4',
    name: 'Gaming Gear Set - Green Neon',
    price: 134.99,
    description: 'Neon green edition for style',
    imageUrl: '/products/g4.png',
    rating: 4.6,
    reviewCount: 18,
    category: 'electronics',
    stock: 16,
    productType: 'grandchild',
    parentId: 'local-gaming-gear-g'
  },
  // Gaming Microphone variants
  {
    id: 'local-microphone-mic1',
    name: 'Gaming Microphone - Black Studio',
    price: 79.99,
    description: 'Professional black studio microphone',
    imageUrl: '/products/mic1.png',
    rating: 4.5,
    reviewCount: 20,
    category: 'electronics',
    stock: 15,
    productType: 'grandchild',
    parentId: 'local-microphone'
  },
  {
    id: 'local-microphone-mic2',
    name: 'Gaming Microphone - White Clean',
    price: 79.99,
    description: 'Clean white edition microphone',
    imageUrl: '/products/mic2.png',
    rating: 4.5,
    reviewCount: 18,
    category: 'electronics',
    stock: 14,
    productType: 'grandchild',
    parentId: 'local-microphone'
  },
  {
    id: 'local-microphone-mic3',
    name: 'Gaming Microphone - Red Stream',
    price: 89.99,
    description: 'Red streaming edition with enhanced audio',
    imageUrl: '/products/mic3.png',
    rating: 4.6,
    reviewCount: 16,
    category: 'electronics',
    stock: 12,
    productType: 'grandchild',
    parentId: 'local-microphone'
  },
  {
    id: 'local-microphone-mic4',
    name: 'Gaming Microphone - Blue Podcast',
    price: 89.99,
    description: 'Blue podcast edition for content creators',
    imageUrl: '/products/mic4.png',
    rating: 4.6,
    reviewCount: 15,
    category: 'electronics',
    stock: 13,
    productType: 'grandchild',
    parentId: 'local-microphone'
  },
  // Gaming Controller variants
  {
    id: 'local-controller-p1',
    name: 'Gaming Controller - Black Classic',
    price: 59.99,
    description: 'Classic black wireless controller',
    imageUrl: '/products/p1.png',
    rating: 4.6,
    reviewCount: 30,
    category: 'electronics',
    stock: 20,
    productType: 'grandchild',
    parentId: 'local-controller-p'
  },
  {
    id: 'local-controller-p2',
    name: 'Gaming Controller - White Pure',
    price: 59.99,
    description: 'Pure white edition controller',
    imageUrl: '/products/p2.png',
    rating: 4.6,
    reviewCount: 28,
    category: 'electronics',
    stock: 18,
    productType: 'grandchild',
    parentId: 'local-controller-p'
  },
  {
    id: 'local-controller-p3',
    name: 'Gaming Controller - Red Fire',
    price: 64.99,
    description: 'Fire red edition with enhanced grip',
    imageUrl: '/products/p3.png',
    rating: 4.7,
    reviewCount: 25,
    category: 'electronics',
    stock: 15,
    productType: 'grandchild',
    parentId: 'local-controller-p'
  },
  {
    id: 'local-controller-p4',
    name: 'Gaming Controller - Blue Ocean',
    price: 64.99,
    description: 'Ocean blue edition controller',
    imageUrl: '/products/p4.png',
    rating: 4.7,
    reviewCount: 22,
    category: 'electronics',
    stock: 17,
    productType: 'grandchild',
    parentId: 'local-controller-p'
  },
  // RGB Light Strip variants
  {
    id: 'local-rgb-light-r1',
    name: 'RGB Light Strip - Standard 2M',
    price: 29.99,
    description: 'Standard 2 meter RGB light strip',
    imageUrl: '/products/r1.png',
    rating: 4.3,
    reviewCount: 15,
    category: 'electronics',
    stock: 35,
    productType: 'grandchild',
    parentId: 'local-rgb-light-r'
  },
  {
    id: 'local-rgb-light-r2',
    name: 'RGB Light Strip - Extended 5M',
    price: 49.99,
    description: 'Extended 5 meter RGB light strip',
    imageUrl: '/products/r2.png',
    rating: 4.4,
    reviewCount: 18,
    category: 'electronics',
    stock: 30,
    productType: 'grandchild',
    parentId: 'local-rgb-light-r'
  },
  {
    id: 'local-rgb-light-r3',
    name: 'RGB Light Strip - Pro 10M',
    price: 69.99,
    description: 'Professional 10 meter RGB light strip',
    imageUrl: '/products/r3.png',
    rating: 4.5,
    reviewCount: 12,
    category: 'electronics',
    stock: 25,
    productType: 'grandchild',
    parentId: 'local-rgb-light-r'
  },
  // USB Hub variants
  {
    id: 'local-usb-hub-u1',
    name: 'USB Hub - Black Compact',
    price: 34.99,
    description: 'Compact black USB 3.0 hub',
    imageUrl: '/products/u1.png',
    rating: 4.4,
    reviewCount: 12,
    category: 'electronics',
    stock: 25,
    productType: 'grandchild',
    parentId: 'local-usb-hub-u'
  },
  {
    id: 'local-usb-hub-u2',
    name: 'USB Hub - White Slim',
    price: 34.99,
    description: 'Slim white USB 3.0 hub',
    imageUrl: '/products/u2.png',
    rating: 4.4,
    reviewCount: 10,
    category: 'electronics',
    stock: 22,
    productType: 'grandchild',
    parentId: 'local-usb-hub-u'
  },
  {
    id: 'local-usb-hub-u3',
    name: 'USB Hub - Gray Pro',
    price: 39.99,
    description: 'Professional gray USB 3.0 hub',
    imageUrl: '/products/u3.png',
    rating: 4.5,
    reviewCount: 8,
    category: 'electronics',
    stock: 20,
    productType: 'grandchild',
    parentId: 'local-usb-hub-u'
  },
  {
    id: 'local-usb-hub-u4',
    name: 'USB Hub - Blue Glow',
    price: 39.99,
    description: 'Blue glow USB 3.0 hub with LED',
    imageUrl: '/products/u4.png',
    rating: 4.5,
    reviewCount: 8,
    category: 'electronics',
    stock: 18,
    productType: 'grandchild',
    parentId: 'local-usb-hub-u'
  }
]

// All products combined
export const allLocalProducts: Product[] = [
  parentProduct,
  ...childProducts,
  ...grandchildProducts
]

// Export for use in API fallback
export default {
  parent: parentProduct,
  children: childProducts,
  grandchildren: grandchildProducts,
  all: allLocalProducts
}
