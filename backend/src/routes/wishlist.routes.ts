import { Router } from 'express';
import {
  getWishlist,
  getWishlistProductIds,
  addToWishlist,
  addToWishlistValidation,
  removeFromWishlist,
  removeFromWishlistValidation,
  clearWishlist,
  moveWishlistItemToCart,
  moveToCartValidation,
} from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.get('/ids', getWishlistProductIds);
router.post('/items', validate(addToWishlistValidation), addToWishlist);
router.delete('/', clearWishlist);
router.delete('/items/:productId', validate(removeFromWishlistValidation), removeFromWishlist);
router.post(
  '/items/:productId/move-to-cart',
  validate(moveToCartValidation),
  moveWishlistItemToCart
);

export default router;
