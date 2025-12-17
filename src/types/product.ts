export interface ColorVariant {
  name: string // Color name (e.g., 'Black', 'White', 'Blue')
  colorCode: string // Hex color code
  imageUrl: string // Image for this color variant
}

export interface Category {
  id: string
  _id?: string // MongoDB ID
  name: string
  description?: string
  color: string // Hex color for category badge
  imageUrl?: string // Thumbnail image for category card
}

export interface Review {
  id: string
  productId: string
  userName: string
  userId: string
  userEmail?: string // User email address
  rating: number // 1-5 stars
  comment?: string // Optional - user can rate without comment
  viewType?: 'gallery' | 'immersive' // Separate reviews for different view types
  createdAt: string
  replies?: ReviewReply[]
  profilePic?: string // User profile picture URL
}

export interface Comment {
  id: string
  productId: string
  userName: string
  userId: string
  userEmail?: string
  comment: string
  viewType?: 'gallery' | 'immersive'
  createdAt: string
  profilePic?: string
  isVerified?: boolean
  likes: number
  likedBy: string[]
  parentCommentId?: string
  replyTo?: string
}

export interface ReviewReply {
  id: string
  userName: string
  userId: string
  isAdmin: boolean
  comment: string
  createdAt: string
}

export interface Slide {
  id: string
  title: string
  description: string
  imageUrl: string
  linkTo?: string // Optional link (e.g., '/products/1')
  buttonText?: string
  order: number
}

export interface Product {
  id: string
  _id?: string // MongoDB ID
  name: string
  price: number
  description: string
  imageUrl: string
  rating: number // Calculated average from reviews
  reviewCount?: number // Total number of reviews
  color?: string // Optional color variant (e.g., 'Black', 'White', 'Blue')
  features?: string[] // Product features (e.g., 'Premium materials', 'Advanced tech')
  colorVariants?: ColorVariant[] // Available color variants for immersive mode
  category?: string // Category ID for filtering/organization
  stock?: number // Stock quantity
  colors?: string[] // Array of color codes
}
