import { PrismaClient, Role, Plan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!email || !password) {
    console.log('[seed] SUPERADMIN_EMAIL/PASSWORD not set, skipping superadmin seed');
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== Role.ADMIN_MASTER) {
      await prisma.user.update({
        where: { email },
        data: { role: Role.ADMIN_MASTER },
      });
      console.log(`[seed] Promoted ${email} to ADMIN_MASTER`);
    } else {
      console.log(`[seed] Superadmin ${email} already exists`);
    }
    return;
  }
  const company = await prisma.company.create({
    data: { name: 'Glee-go Master', email, plan: Plan.BUSINESS },
  });
  const passwordHash = await bcrypt.hash(password, 10);
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

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());