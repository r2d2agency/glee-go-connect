import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsString() fullName!: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() bio?: any;
}

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register({
      ...dto,
      companyName: dto.companyName || dto.fullName,
    });
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}