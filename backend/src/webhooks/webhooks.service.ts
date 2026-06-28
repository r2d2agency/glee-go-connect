import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export type WebhookEvent =
  | 'lead.created'
  | 'card.viewed'
  | 'card.activated'
  | 'test.ping';

const ALL_EVENTS: WebhookEvent[] = ['lead.created', 'card.viewed', 'card.activated', 'test.ping'];

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  static events() {
    return ALL_EVENTS;
  }

  list(companyId: string) {
    return this.prisma.webhook.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listDeliveries(companyId: string, webhookId: string) {
    const hook = await this.prisma.webhook.findFirst({ where: { id: webhookId, companyId } });
    if (!hook) throw new NotFoundException();
    return this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async create(companyId: string, body: { name: string; url: string; events?: string[]; cardSlug?: string | null; active?: boolean }) {
    if (!body?.url || !/^https?:\/\//i.test(body.url)) {
      throw new ForbiddenException('URL inválida (use http:// ou https://)');
    }
    const events = (body.events ?? ['lead.created']).filter((e) =>
      (ALL_EVENTS as string[]).includes(e),
    );
    return this.prisma.webhook.create({
      data: {
        companyId,
        name: (body.name || 'Webhook').slice(0, 80),
        url: body.url.trim(),
        events,
        cardSlug: body.cardSlug || null,
        active: body.active ?? true,
        secret: 'whsec_' + randomBytes(24).toString('hex'),
      },
    });
  }

  async update(companyId: string, id: string, body: Partial<{ name: string; url: string; events: string[]; cardSlug: string | null; active: boolean }>) {
    const hook = await this.prisma.webhook.findFirst({ where: { id, companyId } });
    if (!hook) throw new NotFoundException();
    const data: any = {};
    if (body.name !== undefined) data.name = body.name.slice(0, 80);
    if (body.url !== undefined) {
      if (!/^https?:\/\//i.test(body.url)) throw new ForbiddenException('URL inválida');
      data.url = body.url.trim();
    }
    if (body.events !== undefined) data.events = body.events.filter((e) => (ALL_EVENTS as string[]).includes(e));
    if (body.cardSlug !== undefined) data.cardSlug = body.cardSlug || null;
    if (body.active !== undefined) data.active = !!body.active;
    return this.prisma.webhook.update({ where: { id }, data });
  }

  async rotateSecret(companyId: string, id: string) {
    const hook = await this.prisma.webhook.findFirst({ where: { id, companyId } });
    if (!hook) throw new NotFoundException();
    return this.prisma.webhook.update({
      where: { id },
      data: { secret: 'whsec_' + randomBytes(24).toString('hex') },
    });
  }

  async remove(companyId: string, id: string) {
    const hook = await this.prisma.webhook.findFirst({ where: { id, companyId } });
    if (!hook) throw new NotFoundException();
    await this.prisma.webhook.delete({ where: { id } });
    return { ok: true };
  }

  async test(companyId: string, id: string) {
    const hook = await this.prisma.webhook.findFirst({ where: { id, companyId } });
    if (!hook) throw new NotFoundException();
    return this.deliver(hook, 'test.ping', {
      message: 'Glee-go ID test ping',
      at: new Date().toISOString(),
    });
  }

  /** Fire-and-forget dispatch from app code (e.g. when a lead is captured). */
  dispatch(companyId: string, event: WebhookEvent, payload: any, opts?: { cardSlug?: string }) {
    // run async, never block caller
    setImmediate(async () => {
      try {
        const hooks = await this.prisma.webhook.findMany({
          where: { companyId, active: true },
        });
        await Promise.all(
          hooks
            .filter((h: any) => h.events.includes(event))
            .filter((h: any) => !h.cardSlug || h.cardSlug === opts?.cardSlug)
            .map((h: any) => this.deliver(h, event, payload).catch(() => null)),
        );
      } catch {
        /* swallow */
      }
    });
  }

  private async deliver(hook: any, event: WebhookEvent, payload: any) {
    const t0 = Date.now();
    const body = JSON.stringify({
      id: 'evt_' + randomBytes(8).toString('hex'),
      event,
      created_at: new Date().toISOString(),
      data: payload,
    });
    const ts = Math.floor(Date.now() / 1000).toString();
    const sig = createHmac('sha256', hook.secret).update(ts + '.' + body).digest('hex');
    let status: number | null = null;
    let response = '';
    let error: string | null = null;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GleegoID-Webhook/1.0',
          'X-Gleego-Event': event,
          'X-Gleego-Timestamp': ts,
          'X-Gleego-Signature': `t=${ts},v1=${sig}`,
        },
        body,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      status = res.status;
      response = (await res.text()).slice(0, 2000);
      if (!res.ok) error = `HTTP ${res.status}`;
    } catch (e: any) {
      error = e?.message || 'request failed';
    }
    const ok = !error;
    await this.prisma.webhookDelivery.create({
      data: {
        webhookId: hook.id,
        event,
        payload,
        status: status ?? undefined,
        response,
        error: error ?? undefined,
        durationMs: Date.now() - t0,
      },
    });
    await this.prisma.webhook.update({
      where: { id: hook.id },
      data: {
        lastStatus: status ?? undefined,
        lastError: error,
        lastFiredAt: new Date(),
        successCount: ok ? { increment: 1 } : undefined,
        failureCount: !ok ? { increment: 1 } : undefined,
      },
    });
    return { ok, status, error, durationMs: Date.now() - t0 };
  }

  /** Public helper to verify a Gleego signature (timing-safe). */
  static verifySignature(secret: string, header: string | null, rawBody: string) {
    if (!header) return false;
    const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
    const ts = parts['t'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;
    const expected = createHmac('sha256', secret).update(ts + '.' + rawBody).digest('hex');
    const a = Buffer.from(v1, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
}