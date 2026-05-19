import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { sendOrderConfirmationEmail } from '../services/email.js';

/** Fire-and-forget order confirmation with idempotency via confirmationEmailSentAt. */
export function queueOrderConfirmationEmail(orderId: string): void {
  void sendOrderConfirmationOnce(orderId).catch((err) => {
    console.error('[email] Order confirmation failed:', orderId, err);
  });
}

async function sendOrderConfirmationOnce(orderId: string): Promise<void> {
  const order = await Order.findById(orderId);
  if (!order || order.status !== 'paid' || order.confirmationEmailSentAt) return;

  const user = await User.findById(order.user).select('name email');
  if (!user?.email) return;

  await sendOrderConfirmationEmail({
    to: user.email,
    customerName: user.name,
    order,
  });

  await Order.findByIdAndUpdate(orderId, { confirmationEmailSentAt: new Date() });
}
