import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  qty: number;
}

export interface ICart extends Document {
  user?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

export const Cart: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);
