import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AccountModule } from './account/account.module';
import { AccountTokenModule } from './account/token/account-token.module';

import { ProductModule } from './products/product.module';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/cart.entity';

import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    (() => {
      // Log all relevant env vars for debugging
      console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
      console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
      console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
      console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
      console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
      // Throw if any are missing
      if (!process.env.POSTGRES_HOST || !process.env.POSTGRES_PORT || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_DB) {
        throw new Error('Missing one or more required POSTGRES_* environment variables!');
      }
      return TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT!, 10),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        synchronize: false,
        logging: ['query', 'error']
      });
    })(),

    AccountModule,
    AccountTokenModule,
    ProductModule,
    CartModule,
    OrderModule,
    

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}