import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
  },
  { timestamps: true }
);

export const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
