import { Router } from 'express';
import { param } from 'express-validator';
import {
  getStats,
  getSalesAnalytics,
  listAllOrders,
  updateOrderStatus,
  listUsers,
  updateUserRole,
  updateUserRoleValidation,
  listAdminProducts,
  listCarts,
} from '../controllers/admin.controller.js';
import { uploadProductImage } from '../controllers/upload.controller.js';
import { productImageUpload } from '../middleware/upload.js';
import { AppError } from '../utils/AppError.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdParam,
} from '../controllers/category.controller.js';
import { listAllReviews, deleteReview } from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/analytics', getSalesAnalytics);
router.post(
  '/upload',
  (req, res, next) => {
    productImageUpload(req, res, (err: unknown) => {
      if (err) {
        next(new AppError(err instanceof Error ? err.message : 'Upload failed', 400));
        return;
      }
      next();
    });
  },
  uploadProductImage
);
router.get('/orders', listAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/users', listUsers);
router.patch('/users/:id/role', validate(updateUserRoleValidation), updateUserRole);
router.get('/products', listAdminProducts);
router.get('/carts', listCarts);

router.post('/categories', validate(createCategoryValidation), createCategory);
router.put('/categories/:id', validate(updateCategoryValidation), updateCategory);
router.delete('/categories/:id', validate(categoryIdParam), deleteCategory);

router.get('/reviews', listAllReviews);
router.delete('/reviews/:id', validate([param('id').isMongoId()]), deleteReview);

export default router;
