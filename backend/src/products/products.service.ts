import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';

import { CreateProductDto } from './dto-product/create-product.dto';

@Injectable()
export class ProductService{
constructor(

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
) {}
    async getAllProducts(){
        return this.productRepo.find({
        relations : ['categories']
        });
    }

   async getProductByID(id: number) {
  return await this.productRepo.findOne({
    where: { id },
  });
}


   async getProductsByName(title: string) {
  return this.productRepo
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.categories', 'category')
    .where('product.title ILIKE :title', { title: `%${title}%` })
    .getMany();
    }

    async createProduct(dto: CreateProductDto){
        const categories = await this.categoryRepo.find({
            where: dto.categories.map(name => ({name})),
        });

        const product = this.productRepo.create({
            title: dto.title,
            brand: dto.brand,
            description: dto.description,
            price: dto.price,
            categories,
        })

        try {
            return await this.productRepo.save(product);
        } catch (_error) {
            throw new BadRequestException('Failed to create product');
        }
    }

   async getProductsByCategory(categoryName: string) {
  const category = await this.categoryRepo.findOne({
    where: { name: categoryName },
  });

  if (!category) {
    throw new NotFoundException('Category not found');
  }

  return this.productRepo.find({
    relations: ['categories'],
    where: {
      categories: {
        id: category.id,
      },
    },
  });
}



}
