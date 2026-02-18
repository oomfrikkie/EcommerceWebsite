
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min, ArrayNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class OrderProductDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  product_id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  account_id: number;

  @ApiProperty({ example: 129.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ type: [OrderProductDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
