import { Cart, type ICart } from '../models/Cart.js';
import { AppError } from './AppError.js';
import { getProductId } from './cartHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';

const PRODUCT_SELECT = 'name slug price images stock active';

export async function resolveCart(req: AuthRequest, populate = false): Promise<ICart> {
  const sessionId = req.headers['x-session-id'] as string | undefined;

  if (req.user) {
    let userCart = await Cart.findOne({ user: req.user._id });

    if (sessionId) {
      const guestCart = await Cart.findOne({
        sessionId,
        $or: [{ user: { $exists: false } }, { user: null }],
      });

      if (guestCart?.items.length) {
        if (!userCart) {
          await Cart.updateOne(
            { _id: guestCart._id },
            { $set: { user: req.user._id }, $unset: { sessionId: '' } }
          );
          userCart =
            (await Cart.findOne({ user: req.user._id })) ??
            (await Cart.create({ user: req.user._id, items: guestCart.items }));
        } else {
          for (const item of guestCart.items) {
            const pid = getProductId(item.product);
            const existing = userCart.items.find((i) => getProductId(i.product) === pid);
            if (existing) {
              existing.qty += item.qty;
            } else {
              userCart.items.push({ product: item.product, qty: item.qty });
            }
          }
          await userCart.save();
          await Cart.deleteOne({ _id: guestCart._id });
        }
      }
    }

    if (!userCart) {
      userCart = await Cart.create({ user: req.user._id, items: [] });
    }

    if (populate) {
      await userCart.populate({ path: 'items.product', select: PRODUCT_SELECT });
    }
    return userCart;
  }

  if (!sessionId) throw new AppError('Session ID required for guest cart', 400);

  let sessionCart = await Cart.findOne({ sessionId });
  if (!sessionCart) {
    sessionCart = await Cart.create({ sessionId, items: [] });
  }

  if (populate) {
    await sessionCart.populate({ path: 'items.product', select: PRODUCT_SELECT });
  }
  return sessionCart;
}

/** Clear user cart and any guest cart for this browser session */
export async function clearCartsForUser(
  userId: string,
  sessionId?: string
): Promise<void> {
  await Cart.updateOne({ user: userId }, { $set: { items: [] } });
  if (sessionId) {
    await Cart.deleteMany({ sessionId });
  }
}
