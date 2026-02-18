import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto-account/create-account.dto';
import { LoginDto } from './dto-account/login.dto';
import { ForgotPasswordDto } from './dto-account/forgot-password.dto';
import { ResetPasswordDto } from './dto-account/reset-password.dto';
import { AccountTokenService } from './token/account-token.service';
import { BSON } from 'typeorm';

@Controller('account')
export class AccountController{
    constructor(
  private readonly accountService: AccountService,
  private readonly tokenService: AccountTokenService,
) {}

@Get(':id')
getAccountById(@Param('id') id: number) {
  return this.accountService.getAccountById(id);
}


@Post('register')
createProfile(@Body() dto: CreateAccountDto){
    return this.accountService.createProfile(dto)
}

@Post('login')
login(@Body() dto: LoginDto){
    return this.accountService.login(dto)
}

@Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.tokenService.verifyToken({
      token,
      token_type: 'EMAIL_VERIFICATION',
    });
  }
}