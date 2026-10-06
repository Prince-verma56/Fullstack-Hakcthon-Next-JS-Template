/**
 * Prisma Seed Script
 *
 * Populates the database with demo data for development and presentations.
 *
 * Usage:
 *   npx prisma db seed
 *   npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@hackathon.dev' },
    update: {},
    create: {
      clerkUserId: 'seed_demo_user',
      email: 'demo@hackathon.dev',
      name: 'Demo User',
      role: 'user',
    },
  });

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hackathon.dev' },
    update: {},
    create: {
      clerkUserId: 'seed_admin_user',
      email: 'admin@hackathon.dev',
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('✅ Seeded users:', { demoUser: demoUser.email, adminUser: adminUser.email });
  console.log('🌱 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
