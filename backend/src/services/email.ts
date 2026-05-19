import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.js';
import type { IOrder } from '../models/Order.js';

export interface OrderEmailPayload {
  to: string;
  customerName: string;
  order: IOrder;
}

function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function buildOrderConfirmationHtml(payload: OrderEmailPayload): string {
  const { customerName, order } = payload;
  const orderUrl = `${env.clientUrl}/account/orders/${order._id}`;
  const rows = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
          <strong>${item.name}</strong><br />
          <span style="color:#64748b;font-size:14px;">Qty ${item.qty} × ${formatMoney(item.price)}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
          ${formatMoney(item.price * item.qty)}
        </td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Order confirmation</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#4f46e5;padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;">ShopVerse</h1>
            <p style="margin:8px 0 0;color:#c7d2fe;font-size:14px;">Order confirmation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#334155;">Hi ${customerName},</p>
            <p style="margin:0 0 24px;color:#334155;line-height:1.6;">
              Thank you for your order! We've received your payment and are preparing your items.
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Order #${order._id.toString().slice(-8).toUpperCase()}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;">
              ${rows}
              <tr>
                <td style="padding:8px 0;color:#64748b;">Subtotal</td>
                <td style="padding:8px 0;text-align:right;">${formatMoney(order.itemsPrice)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;">Shipping</td>
                <td style="padding:8px 0;text-align:right;">${order.shippingPrice === 0 ? 'FREE' : formatMoney(order.shippingPrice)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;">Tax</td>
                <td style="padding:8px 0;text-align:right;">${formatMoney(order.taxPrice)}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;font-weight:700;font-size:16px;">Total</td>
                <td style="padding:12px 0;text-align:right;font-weight:700;font-size:16px;">${formatMoney(order.totalPrice)}</td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Ship to</p>
            <p style="margin:0 0 24px;color:#334155;line-height:1.5;">
              ${order.shippingAddress.fullName}<br />
              ${order.shippingAddress.street}<br />
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br />
              ${order.shippingAddress.country}
            </p>
            <a href="${orderUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">
              View order details
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f1f5f9;text-align:center;font-size:12px;color:#64748b;">
            Questions? Reply to this email or visit your account at ShopVerse.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildOrderConfirmationText(payload: OrderEmailPayload): string {
  const { customerName, order } = payload;
  const orderUrl = `${env.clientUrl}/account/orders/${order._id}`;
  const items = order.orderItems
    .map((i) => `- ${i.name} × ${i.qty} — ${formatMoney(i.price * i.qty)}`)
    .join('\n');

  return `Hi ${customerName},

Thank you for your order at ShopVerse!

Order #${order._id.toString().slice(-8).toUpperCase()}

${items}

Subtotal: ${formatMoney(order.itemsPrice)}
Shipping: ${order.shippingPrice === 0 ? 'FREE' : formatMoney(order.shippingPrice)}
Tax: ${formatMoney(order.taxPrice)}
Total: ${formatMoney(order.totalPrice)}

Ship to:
${order.shippingAddress.fullName}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}
${order.shippingAddress.country}

View your order: ${orderUrl}`;
}

async function sendViaResend(payload: OrderEmailPayload, subject: string, html: string, text: string): Promise<void> {
  const resend = new Resend(env.email.resendApiKey);
  const { error } = await resend.emails.send({
    from: env.email.from,
    to: payload.to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(error.message);
}

async function sendViaSmtp(payload: OrderEmailPayload, subject: string, html: string, text: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.email.smtp.host,
    port: env.email.smtp.port,
    secure: env.email.smtp.secure,
    auth: {
      user: env.email.smtp.user,
      pass: env.email.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: env.email.from,
    to: payload.to,
    subject,
    html,
    text,
  });
}

function logDevEmail(payload: OrderEmailPayload, subject: string, text: string): void {
  console.info('\n--- ShopVerse email (dev — no provider configured) ---');
  console.info(`To: ${payload.to}`);
  console.info(`Subject: ${subject}`);
  console.info(text);
  console.info('---\n');
}

/** Send order confirmation. No-op when email is disabled; throws on provider errors. */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<void> {
  if (!env.email.enabled) {
    if (env.nodeEnv !== 'production') {
      logDevEmail(payload, `Order confirmed — ShopVerse #${payload.order._id.toString().slice(-8)}`, buildOrderConfirmationText(payload));
    }
    return;
  }

  const subject = `Order confirmed — ShopVerse #${payload.order._id.toString().slice(-8).toUpperCase()}`;
  const html = buildOrderConfirmationHtml(payload);
  const text = buildOrderConfirmationText(payload);

  if (env.email.provider === 'resend') {
    await sendViaResend(payload, subject, html, text);
    return;
  }

  if (env.email.provider === 'smtp') {
    await sendViaSmtp(payload, subject, html, text);
    return;
  }
}
