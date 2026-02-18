
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto-order/create-order.dto';
import { Product } from '../products/product.entity';

@Injectable()
export class OrderService{

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) {}


    async createOrder(dto: CreateOrderDto) {
        // Find all products by ids
        const productIds = dto.products.map(p => p.product_id);
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
        // Optionally, handle quantities in order_products table if needed
        return savedOrder;
    }


    async getAllOrders() {
        return this.orderRepo.find({
            relations: ['account', 'products'],
            order: { created_at: 'DESC' },
        });
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