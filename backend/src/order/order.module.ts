import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Product } from '../products/product.entity';
import { ProductModule } from '../products/product.module';
import { Account } from '../account/account.entity';
import { OrderEmailService } from './order-email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, Account]),
    ProductModule,
  ],
  providers: [OrderService, OrderEmailService],
  controllers: [OrderController],
})
export class OrderModule {}
