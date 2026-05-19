import type { Types } from 'mongoose';

/** Product ref may be ObjectId or populated document */
export function getProductId(product: Types.ObjectId | { _id: Types.ObjectId }): string {
  if (product && typeof product === 'object' && '_id' in product) {
    return String((product as { _id: Types.ObjectId })._id);
  }
  return String(product);
}
