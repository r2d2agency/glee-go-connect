import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsString() fullName!: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() source?: string;
}

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private prisma: PrismaService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: true },
    });
    if (!user) return null;
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}