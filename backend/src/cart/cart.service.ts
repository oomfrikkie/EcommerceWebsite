import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from 'src/cart_item/cart-item.entity';
import { Product } from '../products/product.entity';
import { Account } from '../account/account.entity';
import { AddToCartDto } from './dto-cart/add-to-cart.dto';
import { UpdateCartItemDto } from './dto-cart/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async getCart(accountId: number): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { account: { id: accountId }, status: 'ACTIVE' },
      relations: ['items', 'items.product', 'account'],
    });

    if (!cart) {
      const account = await this.accountRepo.findOneBy({ id: accountId });
      if (!account) throw new NotFoundException('Account not found');

      cart = this.cartRepo.create({ account, status: 'ACTIVE' });
      await this.cartRepo.save(cart);
    }

    return cart;
  }

  
  async addToCart(dto: AddToCartDto) {
    const { accountId, productId, quantity } = dto;

    const cart = await this.getCart(accountId);

    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    const existingItem = await this.cartItemRepo.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      const savedItem = await this.cartItemRepo.save(existingItem);
      return {
        id: savedItem.id,
        product: savedItem.product,
        quantity: savedItem.quantity,
        account: {
          id: cart.account.id,
          first_name: cart.account.first_name,
          last_name: cart.account.last_name,
          email: cart.account.email,
        },
      };
    }

    const item = this.cartItemRepo.create({
      cart,
      product,
      quantity,
    });

    const savedItem = await this.cartItemRepo.save(item);
    return {
      id: savedItem.id,
      product: savedItem.product,
      quantity: savedItem.quantity,
      account: {
        id: cart.account.id,
        first_name: cart.account.first_name,
        last_name: cart.account.last_name,
        email: cart.account.email,
      },
    };
  }

 
  async updateItemQuantity(dto: UpdateCartItemDto) {
    const { cartItemId, quantity } = dto;

    const item = await this.cartItemRepo.findOneBy({ id: cartItemId });
    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await this.cartItemRepo.remove(item);
      return { removed: true };
    }

    item.quantity = quantity;
    return this.cartItemRepo.save(item);
  }

  async removeItem(cartItemId: number) {
    const item = await this.cartItemRepo.findOneBy({ id: cartItemId });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartItemRepo.remove(item);
    return { removed: true };
  }

  async clearCart(accountId: number) {
    const cart = await this.getCart(accountId);
    await this.cartItemRepo.delete({ cart: { id: cart.id } });
    return { cleared: true };
  }
}
