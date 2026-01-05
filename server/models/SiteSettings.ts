import mongoose, { Schema, Document } from 'mongoose'

export interface ISiteSettings extends Document {
  isFrozen: boolean
  freezeMessage: string
  freezeUntil: Date | null
  frozenBy: mongoose.Types.ObjectId | null
  frozenAt: Date | null
  updatedAt: Date
}

const SiteSettingsSchema: Schema = new Schema(
  {
    isFrozen: {
      type: Boolean,
      default: false
    },
    freezeMessage: {
      type: String,
      default: 'The website is currently under maintenance. Please check back later.'
    },
    freezeUntil: {
      type: Date,
      default: null
    },
    frozenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    frozenAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)
