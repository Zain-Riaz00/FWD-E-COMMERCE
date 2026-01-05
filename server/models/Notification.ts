import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  type: 'order' | 'reward' | 'product' | 'system' | 'reply' | 'contact' | 'inventory' | 'feedback' | 'admin_action' | 'recommendation'
  title: string
  message: string
  timestamp: Date
  meta?: string
  status: 'new' | 'read'
  userId?: string
  isAdminNotification: boolean
  linkTo?: string // Navigation link for clickable notifications
  source: 'seed' | 'live'
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['order', 'reward', 'product', 'system', 'reply', 'contact', 'inventory', 'feedback', 'admin_action', 'recommendation'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    meta: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'read'],
      default: 'new'
    },
    userId: {
      type: String,
      trim: true
    },
    isAdminNotification: {
      type: Boolean,
      default: false
    },
    linkTo: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: ['seed', 'live'],
      default: 'live'
    }
  },
  {
    timestamps: true
  }
)

// Index for faster queries
NotificationSchema.index({ userId: 1, status: 1, timestamp: -1 })
NotificationSchema.index({ isAdminNotification: 1, status: 1, timestamp: -1 })

export default mongoose.model<INotification>('Notification', NotificationSchema)
