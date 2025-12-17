import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  price: number
  description: string
  imageUrl: string
  rating: number
  reviewCount: number
  category?: string
  stock?: number
  colors?: string[]
  colorVariants?: Array<{
    color: string
    name: string
    imageUrl: string
  }>
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add an image URL']
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    category: {
      type: String,
      default: 'Uncategorized'
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    colors: {
      type: [String],
      default: []
    },
    colorVariants: {
      type: [{
        color: String,
        name: String,
        imageUrl: String
      }],
      default: []
    }
  },
  {
    timestamps: true
  }
)

// Add indexes for faster queries
ProductSchema.index({ name: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.model<IProduct>('Product', ProductSchema)
