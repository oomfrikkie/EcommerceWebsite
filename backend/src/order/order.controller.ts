import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto-order/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Get()
  findAll() {
    return this.orderService.getAllOrders();
  }

  @Get('account/:accountId')
  findByAccount(@Param('accountId') accountId: number) {
    return this.orderService.getOrderByAccount(Number(accountId));
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.orderService.getOrderById(Number(id));
  }
}
