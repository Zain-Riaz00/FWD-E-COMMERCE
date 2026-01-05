import mongoose, { Schema, Document } from 'mongoose'

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId
  userEmail: string
  userName: string
  action: string
  actionType: 'login' | 'logout' | 'register' | 'product_add' | 'product_edit' | 'product_delete' | 'admin_add' | 'admin_remove' | 'freeze' | 'unfreeze' | 'discount' | 'order' | 'other'
  details: string
  ipAddress?: string
  userAgent?: string
  isAdminAction: boolean
  createdAt: Date
}

const ActivityLogSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    actionType: {
      type: String,
      enum: ['login', 'logout', 'register', 'product_add', 'product_edit', 'product_delete', 'admin_add', 'admin_remove', 'freeze', 'unfreeze', 'discount', 'order', 'other'],
      default: 'other'
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    isAdminAction: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient querying
ActivityLogSchema.index({ userId: 1, createdAt: -1 })
ActivityLogSchema.index({ isAdminAction: 1, createdAt: -1 })
ActivityLogSchema.index({ actionType: 1, createdAt: -1 })

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)
