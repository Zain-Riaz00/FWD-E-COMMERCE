import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  productId: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  comment?: string // Optional - user can rate without commenting
  viewType: 'gallery' | 'immersive' // Separate reviews for different view types
  isVerified: boolean
  likes: number
  dislikes: number
  replies: Array<{
    userName: string
    userEmail: string
    comment: string
    isAdmin: boolean
    isVerified: boolean
    timestamp: Date
  }>
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema: Schema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: false, // Optional - user can rate without comment
      trim: true
    },
    viewType: {
      type: String,
      enum: ['gallery', 'immersive'],
      required: true,
      default: 'gallery'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    replies: [
      {
        userName: {
          type: String,
          required: true
        },
        userEmail: {
          type: String,
          required: true
        },
        comment: {
          type: String,
          required: true
        },
        isAdmin: {
          type: Boolean,
          default: false
        },
        isVerified: {
          type: Boolean,
          default: false
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    }
  },
  {
    timestamps: true
  }
)

// Indexes for faster queries
ReviewSchema.index({ productId: 1, viewType: 1, status: 1, createdAt: -1 })
ReviewSchema.index({ userId: 1, productId: 1, viewType: 1 })

export default mongoose.model<IReview>('Review', ReviewSchema)
