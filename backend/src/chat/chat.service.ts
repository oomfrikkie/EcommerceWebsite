import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async processMessage(message: string, accountId?: number): Promise<{ response: string }> {
    const lowerMessage = message.toLowerCase().trim();

    // Extract order ID from message (e.g., "order 123", "order #123", "status of order 123")
    const orderIdMatch = message.match(/order\s*[#:]?\s*(\d+)/i);

    if (orderIdMatch) {
      return this.handleOrderStatusQuery(parseInt(orderIdMatch[1], 10));
    }

    // Check for "my orders" query
    if (lowerMessage.includes('my orders') || lowerMessage.includes('my order')) {
      if (!accountId) {
        return { response: 'Please log in to view your orders.' };
      }
      return this.handleMyOrdersQuery(accountId);
    }

    // Check for order-related keywords
    if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('delivery')) {
      return {
        response: 'I can help you with order information. Please provide an order number (e.g., "status of order 123") or ask about "my orders" if logged in.',
      };
    }

    // Default responses for common queries
    if (this.isGreeting(lowerMessage)) {
      return { response: 'Hello! I can help you track your orders. Ask me "status of order 123" or "my orders" for assistance.' };
    }

    return {
      response: "I'm here to help with order inquiries. You can ask about order status by saying 'status of order 123' or 'my orders' if you're logged in.",
    };
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(g => message.includes(g));
  }

  private async handleOrderStatusQuery(orderId: number): Promise<{ response: string }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['products'],
    });

    if (!order) {
      return { response: `I couldn't find order #${orderId}. Please check the order number and try again.` };
    }

    const statusMessages: Record<string, string> = {
      pending: 'Your order is pending payment.',
      paid: 'Your order has been paid and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered. Enjoy!',
      cancelled: 'This order has been cancelled.',
    };

    const statusMessage = statusMessages[order.status] || `Your order status is: ${order.status}`;
    const formattedDate = order.created_at.toLocaleDateString();

    return {
      response: `Order #${orderId} (placed on ${formattedDate}):\n${statusMessage}\nTotal: $${order.amount}`,
    };
  }

  private async handleMyOrdersQuery(accountId: number): Promise<{ response: string }> {
    const orders = await this.orderRepo.find({
      where: { account_id: accountId },
      order: { created_at: 'DESC' },
      take: 5,
    });

    if (orders.length === 0) {
      return { response: "You don't have any orders yet." };
    }

    const orderList = orders
      .map(o => `Order #${o.id}: ${o.status} - $${o.amount}`)
      .join('\n');

    return {
      response: `Here are your recent orders:\n${orderList}\n\nAsk about a specific order for more details.`,
    };
  }
}