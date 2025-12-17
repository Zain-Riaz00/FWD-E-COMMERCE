import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  description?: string
  color: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: '#3B82F6',
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<ICategory>('Category', CategorySchema)
