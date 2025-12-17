import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  productId: string
  userId: string
  userName: string
  userEmail: string
  comment: string
  viewType: 'gallery' | 'immersive'
  isVerified: boolean
  profilePic?: string
  status: 'pending' | 'approved' | 'rejected'
  likes: number
  likedBy: string[]
  parentCommentId?: string
  replyTo?: string
  createdAt: Date
  updatedAt: Date
}

const CommentSchema: Schema = new Schema(
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
    comment: {
      type: String,
      required: true,
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
    profilePic: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: {
      type: [String],
      default: []
    },
    parentCommentId: {
      type: String,
      default: null
    },
    replyTo: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
)

// Indexes for faster queries
CommentSchema.index({ productId: 1, viewType: 1, status: 1, createdAt: -1 })
CommentSchema.index({ userId: 1 })

export default mongoose.model<IComment>('Comment', CommentSchema)
