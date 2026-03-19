import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface OrderEmailItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

interface SendOrderConfirmationInput {
  toEmail: string;
  orderId: number;
  createdAt: Date;
  totalAmount: number;
  items: OrderEmailItem[];
}

@Injectable()
export class OrderEmailService {
  private readonly logger = new Logger(OrderEmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOrderConfirmation(input: SendOrderConfirmationInput): Promise<boolean> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || '587');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'no-reply@localhost';

    if (!host || !user || !pass) {
      this.logger.warn('Skipping order confirmation email: SMTP_HOST/SMTP_USER/SMTP_PASS are not configured.');
      return false;
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const itemLines = input.items
      .map(
        (item) =>
          `${item.title} x${item.quantity} - $${(item.unitPrice * item.quantity).toFixed(2)}`,
      )
      .join('\n');

    const text = [
      'Thank you for your order!',
      `Order ID: ${input.orderId}`,
      `Date: ${new Date(input.createdAt).toLocaleString()}`,
      '',
      'Items:',
      itemLines,
      '',
      `Total: $${input.totalAmount.toFixed(2)}`,
    ].join('\n');

    const htmlItems = input.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(
              item.unitPrice * item.quantity
            ).toFixed(2)}</td>
          </tr>
        `,
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="margin-bottom: 8px;">Order Confirmation</h2>
        <p>Thank you for your purchase.</p>
        <p><strong>Order ID:</strong> ${input.orderId}<br/>
        <strong>Date:</strong> ${new Date(input.createdAt).toLocaleString()}</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Product</th>
              <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Unit</th>
              <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${htmlItems}</tbody>
        </table>

        <p style="text-align: right; margin-top: 14px;"><strong>Total: $${input.totalAmount.toFixed(2)}</strong></p>
      </div>
    `;

    await transport.sendMail({
      from,
      to: input.toEmail,
      subject: `Order Confirmation #${input.orderId}`,
      text,
      html,
    });

    return true;
  }
}
