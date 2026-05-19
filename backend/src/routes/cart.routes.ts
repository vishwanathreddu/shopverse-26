import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  clearCart,
  addToCartValidation,
  updateCartItemValidation,
} from '../controllers/cart.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', validate(addToCartValidation), addToCart);
router.patch('/items/:productId', validate(updateCartItemValidation), updateCartItem);
router.delete('/', clearCart);

export default router;
