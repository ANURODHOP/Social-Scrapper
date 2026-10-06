const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const p = await prisma.profile.findFirst({ where: { platformId: 'fabriziorom' } });
  console.log(p.id);
  await prisma.$disconnect();
}
run();
