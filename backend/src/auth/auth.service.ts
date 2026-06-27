import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    whatsapp?: string;
    city?: string;
    state?: string;
    industry?: string;
    source?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        email: dto.email,
        whatsapp: dto.whatsapp,
        city: dto.city,
        state: dto.state,
        industry: dto.industry,
        source: dto.source,
      },
    });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: 'ADMIN_COMPANY',
        companyId: company.id,
      },
    });
    return this.sign(user);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return this.sign(user);
  }

  private sign(user: { id: string; email: string; role: string; companyId: string }) {
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });
    return { token, user: { id: user.id, email: user.email, role: user.role, companyId: user.companyId } };
  }
}