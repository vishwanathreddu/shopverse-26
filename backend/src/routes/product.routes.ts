import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductValidation,
  productIdParam,
} from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listProducts);
router.get('/:slugOrId', getProduct);
router.post('/', protect, adminOnly, validate(createProductValidation), createProduct);
router.put('/:id', protect, adminOnly, validate(productIdParam), updateProduct);
router.delete('/:id', protect, adminOnly, validate(productIdParam), deleteProduct);

export default router;
