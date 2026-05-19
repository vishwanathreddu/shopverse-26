import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  createReviewValidation,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, validate(createReviewValidation), createReview);

export default router;
