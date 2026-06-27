import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UpgradesService {
  constructor(private prisma: PrismaService) {}

  // ====== USER ======
  async createForCompany(companyId: string, userId: string, body: any) {
    const open = await this.prisma.upgradeRequest.findFirst({
      where: { companyId, status: 'PENDING' },
    });
    if (open) {
      throw new ConflictException('Você já tem uma solicitação em análise.');
    }
    return this.prisma.upgradeRequest.create({
      data: {
        companyId,
        requestedBy: userId,
        plan: body.plan === 'BUSINESS' ? 'BUSINESS' : 'PRO',
        message: body.message ?? null,
        contactPhone: body.contactPhone ?? null,
        address: body.address ?? null,
      },
    });
  }

  listMine(companyId: string) {
    return this.prisma.upgradeRequest.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ====== ADMIN ======
  listAll(status?: string) {
    return this.prisma.upgradeRequest.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { id: true, name: true, email: true, plan: true } } },
    });
  }

  async approve(id: string, body: any) {
    const req = await this.prisma.upgradeRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException();
    if (req.status !== 'PENDING') throw new ConflictException('Solicitação já processada.');

    const slug = String(body.slug ?? '').trim().toLowerCase();
    if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
      throw new BadRequestException('Slug inválido (use letras minúsculas, números e hífen).');
    }
    const exists = await this.prisma.card.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('Este slug já está em uso.');

    const nfcSerial = body.nfcSerial ? String(body.nfcSerial).trim() : null;
    if (nfcSerial) {
      const dup = await this.prisma.card.findUnique({ where: { nfcSerial } });
      if (dup) throw new ConflictException('Este número de série NFC já está vinculado a outro cartão.');
    }

    const card = await this.prisma.card.create({
      data: {
        companyId: req.companyId,
        type: 'DIGITAL_CARD',
        slug,
        fullName: String(body.fullName ?? 'Novo cartão').slice(0, 120),
        jobTitle: body.jobTitle ?? null,
        phone: body.phone ?? null,
        whatsapp: body.whatsapp ?? null,
        email: body.email ?? null,
        template: body.template ?? 'midnight',
        primaryColor: body.primaryColor ?? '#2563EB',
        accentColor: body.accentColor ?? '#3B82F6',
        bgColor: body.bgColor ?? '#0A0F1F',
        nfcSerial,
        nfcUid: body.nfcUid ?? null,
        nfcLinkedAt: nfcSerial ? new Date() : null,
      },
    });

    await this.prisma.company.update({
      where: { id: req.companyId },
      data: { plan: req.plan },
    });

    return this.prisma.upgradeRequest.update({
      where: { id },
      data: { status: 'APPROVED', adminNote: body.adminNote ?? null, cardId: card.id },
    });
  }

  async reject(id: string, body: any) {
    const req = await this.prisma.upgradeRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException();
    if (req.status !== 'PENDING') throw new ConflictException('Solicitação já processada.');
    return this.prisma.upgradeRequest.update({
      where: { id },
      data: { status: 'REJECTED', adminNote: body?.adminNote ?? null },
    });
  }

  // ====== NFC link/unlink on existing cards ======
  async linkNfc(cardId: string, body: { nfcSerial: string; nfcUid?: string }) {
    const serial = String(body.nfcSerial ?? '').trim();
    if (!serial) throw new BadRequestException('Informe o número de série.');
    const dup = await this.prisma.card.findUnique({ where: { nfcSerial: serial } });
    if (dup && dup.id !== cardId) {
      throw new ConflictException('Número de série já está em uso por outro cartão.');
    }
    return this.prisma.card.update({
      where: { id: cardId },
      data: { nfcSerial: serial, nfcUid: body.nfcUid ?? null, nfcLinkedAt: new Date() },
    });
  }

  async unlinkNfc(cardId: string) {
    return this.prisma.card.update({
      where: { id: cardId },
      data: { nfcSerial: null, nfcUid: null, nfcLinkedAt: null },
    });
  }

  async updateFulfillment(id: string, body: { fulfillmentStatus?: string; trackingCode?: string; carrier?: string; adminNote?: string }) {
    const allowed = ['WAITING', 'PRODUCING', 'SHIPPED', 'DELIVERED', 'ACTIVATED'];
    if (body.fulfillmentStatus && !allowed.includes(body.fulfillmentStatus)) {
      throw new BadRequestException('Status inválido.');
    }
    const data: any = {};
    if (body.fulfillmentStatus) {
      data.fulfillmentStatus = body.fulfillmentStatus;
      if (body.fulfillmentStatus === 'SHIPPED') data.shippedAt = new Date();
      if (body.fulfillmentStatus === 'DELIVERED') data.deliveredAt = new Date();
      if (body.fulfillmentStatus === 'ACTIVATED') data.activatedAt = new Date();
    }
    if (body.trackingCode !== undefined) data.trackingCode = body.trackingCode || null;
    if (body.carrier !== undefined) data.carrier = body.carrier || null;
    if (body.adminNote !== undefined) data.adminNote = body.adminNote || null;
    return this.prisma.upgradeRequest.update({ where: { id }, data });
  }
}