import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  confirmPayment,
  createOrderValidation,
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.post('/', validate(createOrderValidation), createOrder);
router.post('/:id/confirm', confirmPayment);

export default router;
