import mongoose, { Schema, Document } from 'mongoose'

export interface IFeedbackTicket extends Document {
  userId: mongoose.Types.ObjectId
  userEmail: string
  userName: string
  subject: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: 'general' | 'bug' | 'feature' | 'complaint' | 'praise' | 'other'
  adminResponse?: string
  respondedBy?: mongoose.Types.ObjectId
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const FeedbackTicketSchema: Schema = new Schema(
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
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['general', 'bug', 'feature', 'complaint', 'praise', 'other'],
      default: 'general'
    },
    adminResponse: {
      type: String
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient querying
FeedbackTicketSchema.index({ status: 1, createdAt: -1 })
FeedbackTicketSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model<IFeedbackTicket>('FeedbackTicket', FeedbackTicketSchema)
