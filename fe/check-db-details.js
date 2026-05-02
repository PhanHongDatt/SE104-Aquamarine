const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Diagnostics ---');
  
  try {
    const thamSo = await prisma.thamSo.findFirst();
    console.log('ThamSo:', thamSo);
    
    const count = await prisma.phieuDichVu.count();
    console.log('PhieuDichVu count:', count);
    
    // Check if ChiTietDichVu has the new fields by trying to query them
    const chiTiet = await prisma.chiTietDichVu.findFirst();
    if (chiTiet) {
      console.log('Sample ChiTietDichVu fields:', Object.keys(chiTiet));
    } else {
      console.log('No ChiTietDichVu records found.');
    }
  } catch (error) {
    console.error('Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
