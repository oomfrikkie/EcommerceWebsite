
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto-order/create-order.dto';
import { Product } from '../products/product.entity';
import { Account } from '../account/account.entity';
import { OrderEmailService } from './order-email.service';

@Injectable()
export class OrderService{
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(Account)
        private readonly accountRepo: Repository<Account>,
        private readonly orderEmailService: OrderEmailService,
    ) {}


    async createOrder(dto: CreateOrderDto) {
        const account = await this.accountRepo.findOne({ where: { id: dto.account_id } });
        if (!account) {
            throw new NotFoundException('Account not found');
        }

        // Find all products by ids
        const productIds = dto.products.map((p) => p.product_id);
        const products = await this.productRepo.findByIds(productIds);
        if (products.length !== productIds.length) {
            throw new NotFoundException('One or more products not found');
        }

        // Attach products to order
        const order = this.orderRepo.create({
            account_id: dto.account_id,
            amount: dto.amount,
            products: products,
        });
        const savedOrder = await this.orderRepo.save(order);

        const quantityByProductId = new Map<number, number>();
        for (const item of dto.products) {
            quantityByProductId.set(
                item.product_id,
                (quantityByProductId.get(item.product_id) || 0) + item.quantity,
            );
        }

        const emailItems = products.map((product) => ({
            title: product.title,
            quantity: quantityByProductId.get(product.id) || 1,
            unitPrice: Number(product.price),
        }));

        let emailSent = false;
        try {
            this.logger.log(`Sending order confirmation to ${account.email} for order ${savedOrder.id}`);
            emailSent = await this.orderEmailService.sendOrderConfirmation({
                toEmail: account.email,
                orderId: savedOrder.id,
                createdAt: savedOrder.created_at,
                totalAmount: Number(savedOrder.amount),
                items: emailItems,
            });
            this.logger.log(`Order confirmation email sent: ${emailSent}`);
        } catch (error) {
            this.logger.error(`Failed to send order confirmation email: ${error.message}`, error.stack);
        }

        return {
            ...savedOrder,
            email_sent: emailSent,
        };
    }


async getAllOrders() {
    const orders = await this.orderRepo.find({
        relations: ['account', 'products'],
        order: { created_at: 'DESC' },
    });

    if (orders.length === 0) {
        throw new NotFoundException('No orders have been made');
    }

    return orders;
}


    async getOrderByAccount(account_id: number) {
        return this.orderRepo.find({
            where: { account_id: account_id },
            relations: ['products'],
            order: { created_at: 'DESC' },
        });
    }


    async getOrderById(id: number) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }
  
}