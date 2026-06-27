import { PrismaClient, Role, Plan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await seedPlans();
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  const shouldResetPassword = process.env.SUPERADMIN_RESET_PASSWORD === 'true';
  if (!email || !password) {
    console.log('[seed] SUPERADMIN_EMAIL/PASSWORD not set, skipping superadmin seed');
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const passwordHash = shouldResetPassword ? await bcrypt.hash(password, 10) : undefined;
    await prisma.user.update({
      where: { email },
      data: { role: Role.ADMIN_MASTER, ...(passwordHash ? { passwordHash } : {}) },
    });
    console.log(`[seed] Promoted ${email} to ADMIN_MASTER${shouldResetPassword ? ' and reset password from SUPERADMIN_PASSWORD' : ' and kept current database password'}`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const company = await prisma.company.create({
    data: { name: 'Glee-go Master', email, plan: Plan.BUSINESS },
  });
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Super Admin',
      role: Role.ADMIN_MASTER,
      companyId: company.id,
    },
  });
  console.log(`[seed] Created superadmin ${email}`);
}

async function seedPlans() {
  const defaults = [
    { slug: 'free', name: 'Free', description: 'Bio link grátis para começar', priceCents: 0, includesNfc: false, maxBioLinks: 1, maxCards: 0, sortOrder: 1, highlight: false, features: ['1 link de bio', 'Templates básicos', 'Estatísticas simples'] },
    { slug: 'pro', name: 'Pro', description: 'Cartão digital NFC pessoal', priceCents: 9900, includesNfc: true, maxBioLinks: 1, maxCards: 1, sortOrder: 2, highlight: true, features: ['Tudo do Free', '1 cartão NFC', 'vCard / QR Code', 'Pixel Meta + UTM'] },
    { slug: 'business', name: 'Business', description: 'Equipes e múltiplos cartões', priceCents: 29900, includesNfc: true, maxBioLinks: 10, maxCards: 10, sortOrder: 3, highlight: false, features: ['Tudo do Pro', 'Até 10 cartões NFC', 'Painel multiusuário', 'Captura de leads', 'Integração futura CRM Gleego'] },
  ];
  for (const p of defaults) {
    await prisma.planProduct.upsert({
      where: { slug: p.slug },
      update: {},
      create: p as any,
    });
  }
  console.log('[seed] Plans ensured');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());