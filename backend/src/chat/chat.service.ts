import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { Product } from '../products/product.entity';
import { NaiveBayesClassifier } from './nlp/naive-bayes.classifier';
import { TRAINING_DATA } from './nlp/training-data';
import { extractOrderId, extractProductTerm } from './nlp/entity-extractor';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly classifier = new NaiveBayesClassifier();

  /**
   * If the best intent's confidence is below this, we don't trust the guess
   * and fall back to a clarifying message instead of acting on it. Raise it to
   * be more cautious, lower it to be more eager.
   */
  private readonly CONFIDENCE_THRESHOLD = 0.4;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /** Train the classifier once, when the module boots. */
  onModuleInit(): void {
    this.classifier.train(TRAINING_DATA);
  }

  async processMessage(
    message: string,
    accountId?: number,
  ): Promise<{ response: string }> {
    const [best] = this.classifier.predict(message);

    // Low confidence -> we're not sure what they meant. Ask, don't guess.
    if (!best || best.confidence < this.CONFIDENCE_THRESHOLD) {
      return { response: this.fallbackResponse() };
    }

    switch (best.intent) {
      case 'order_status':
        return this.handleOrderStatus(message);
      case 'my_orders':
        return this.handleMyOrders(accountId);
      case 'product_search':
        return this.handleProductSearch(message);
      case 'greeting':
        return {
          response:
            'Hello! I can help you track an order, list your orders, or find products. What do you need?',
        };
      case 'goodbye':
        return { response: 'Thanks for stopping by — happy shopping! 👋' };
      case 'thanks':
        return { response: "You're welcome! Anything else I can help with?" };
      case 'help':
        return { response: this.helpResponse() };
      default:
        return { response: this.fallbackResponse() };
    }
  }

  private async handleOrderStatus(
    message: string,
  ): Promise<{ response: string }> {
    const orderId = extractOrderId(message);
    if (orderId === null) {
      return {
        response:
          'Sure — which order? Please give me the order number, e.g. "status of order 123".',
      };
    }

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['products'],
    });

    if (!order) {
      return {
        response: `I couldn't find order #${orderId}. Please check the number and try again.`,
      };
    }

    const statusMessages: Record<string, string> = {
      pending: 'Your order is pending payment.',
      paid: 'Your order has been paid and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered. Enjoy!',
      cancelled: 'This order has been cancelled.',
    };

    const statusMessage =
      statusMessages[order.status] || `Your order status is: ${order.status}`;
    const formattedDate = order.created_at.toLocaleDateString();

    return {
      response: `Order #${orderId} (placed on ${formattedDate}):\n${statusMessage}\nTotal: $${order.amount}`,
    };
  }

  private async handleMyOrders(
    accountId?: number,
  ): Promise<{ response: string }> {
    if (!accountId) {
      return { response: 'Please log in to view your orders.' };
    }

    const orders = await this.orderRepo.find({
      where: { account_id: accountId },
      order: { created_at: 'DESC' },
      take: 5,
    });

    if (orders.length === 0) {
      return { response: "You don't have any orders yet." };
    }

    const orderList = orders
      .map((o) => `Order #${o.id}: ${o.status} - $${o.amount}`)
      .join('\n');

    return {
      response: `Here are your recent orders:\n${orderList}\n\nAsk about a specific order for more details.`,
    };
  }

  private async handleProductSearch(
    message: string,
  ): Promise<{ response: string }> {
    const term = extractProductTerm(message);

    // No specific term ("what do you sell") -> show a general sample.
    const products = term
      ? await this.productRepo
          .createQueryBuilder('product')
          .where('product.title ILIKE :term', { term: `%${term}%` })
          .orWhere('product.brand ILIKE :term', { term: `%${term}%` })
          .take(5)
          .getMany()
      : await this.productRepo.find({ take: 5 });

    if (products.length === 0) {
      return {
        response: `I couldn't find any products matching "${term}". Try a different name or brand.`,
      };
    }

    const list = products
      .map((p) => `• ${p.title}${p.brand ? ` (${p.brand})` : ''} — $${p.price}`)
      .join('\n');

    const intro = term
      ? `Here's what I found for "${term}":`
      : 'Here are a few of our products:';

    return { response: `${intro}\n${list}` };
  }

  private helpResponse(): string {
    return [
      'I can help you with:',
      '• Order status — "where is order 123?"',
      '• Your orders — "show me my orders" (when logged in)',
      '• Finding products — "do you sell headphones?"',
    ].join('\n');
  }

  private fallbackResponse(): string {
    return [
      "I'm not sure I understood that. I can help with:",
      '• Order status — "status of order 123"',
      '• Your orders — "my orders"',
      '• Products — "do you have laptops?"',
    ].join('\n');
  }
}
