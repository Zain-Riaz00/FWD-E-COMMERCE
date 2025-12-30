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
    price?: number
  }>
  // Hierarchy fields
  parentId?: string  // If set, this is a child of another product
  productType?: 'parent' | 'child' | 'grandchild'  // Type in hierarchy
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema(
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
      type: String, // Store as string for simplicity
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
)

export default mongoose.model<IProduct>('Product', ProductSchema)
