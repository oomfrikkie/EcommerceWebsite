import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Account } from './account.entity';

import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto'; 

import { AccountTokenService } from './token/account-token.service';
import { ForgotPasswordDto } from './dto-account/forgot-password.dto';
import { ResetPasswordDto } from './dto-account/reset-password.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly tokenService: AccountTokenService,
  ) {}


  //register
    async createProfile(dto: CreateAccountDto) {
  if (!dto.email || !dto.password) {
    throw new BadRequestException('Email and/or password is required...');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dto.email)) {
    throw new BadRequestException('Invalid email format...');
  }

  const existing = await this.accountRepo.findOne({
    where: { email: dto.email },
  });

  if (existing) {
    throw new BadRequestException('Account with that email exists already...');
  }

  const hashed = await bcrypt.hash(dto.password, 10);

  const newAccount = this.accountRepo.create({
    email: dto.email,
    first_name: dto.first_name,
    last_name: dto.last_name,
    password_hash: hashed,
    is_verified: false,
    status: 'AWAITING_VERIFICATION',
    failed_login_attempts: 0,
  });

  let savedAccount: Account;

  try {
    savedAccount = await this.accountRepo.save(newAccount);
  } catch (error) {
    throw new BadRequestException(
      'Failed to create account. Please try again later.',
    );
  }

  const tokenResult = await this.tokenService.createToken({
    token_type: 'EMAIL_VERIFICATION',
    account_id: savedAccount.id,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  return {
    message: 'Account created',
    account_id: savedAccount.id,
    email: savedAccount.email,
    verification_token: tokenResult.token,
    verification_link: `/account/verify/${tokenResult.token}`,
  };
}


  async login(dto:LoginDto){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new UnauthorizedException('Invalid email format...');
    }

    const existing = await this.accountRepo.findOne({
      where: {email: dto.email},
    });

    if(!existing){
      throw new BadRequestException("Account with email does not exist...");
    }

    if(existing.status == "BLOCKED"){
      throw new BadRequestException("Account is blocked...");
    }
    else if(existing.status == "AWAITING_VERIFICATION"){
      throw new BadRequestException("Account is not verified...");
    }

    const match = await bcrypt.compare(dto.password, existing.password_hash);

    if (!match){
      existing.failed_login_attempts += 1;
      await this.accountRepo.save(existing);
      throw new BadRequestException("Password was incorrect..");
    }

      try {
        existing.failed_login_attempts = 0;
        await this.accountRepo.save(existing);

        return {
  message: 'Login successful',
  account_id: existing.id,
  email: existing.email,
};

    } catch (error) {
      throw new BadRequestException('Login succeeded but failed to update account state.',);
    }
  }
async getAccountById(id: number) {
  const account = await this.accountRepo.findOne({
    where: { id },
    select: ['id', 'first_name', 'last_name', 'email'],
  });

  if (!account) {
    throw new NotFoundException('Account not found');
  }

  return account;
}





  }