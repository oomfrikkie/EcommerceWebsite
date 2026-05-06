import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto-product/create-product.dto';

@Controller('products')
export class ProductController{
    constructor(
        private readonly productService: ProductService) {}
    
    @Post()
    async createProduct(@Body() dto: CreateProductDto) {
        return this.productService.createProduct(dto);
    }

    @Get()
    async getAllproducts(){
        return this.productService.getAllProducts();
    }

   @Get('title')
  getProducts(@Query('title') title: string) {
      return this.productService.getProductsByName(title);
  }

    @Get(':id')
    async getProductById(@Param('id') id: number){
        return this.productService.getProductByID(id);
    }

    @Get('category/by-name')
    async getProductsByCategory(@Query('name') categoryName : string){
        return this.productService.getProductsByCategory(categoryName);
    }
}