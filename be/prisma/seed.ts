import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Insert base Roles/Admin, LoaiSanPham, NhaCungCap etc.
  const admin = await prisma.loaiSanPham.create({
    data: {
      ten: 'Vàng 9999',
      phanTramLoiNhuan: 10.5
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
