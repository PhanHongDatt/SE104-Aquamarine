const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const users = await prisma.nguoiDung.findMany({
      include: { nhomNguoiDung: true }
    });
    console.log('Users in DB:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
