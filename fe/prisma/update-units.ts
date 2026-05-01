import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating existing units with international standards...')

  const updates = [
    { ten: 'Chỉ', rate: 3.75 },
    { ten: 'Gram', rate: 1.0 },
    { ten: 'Lượng', rate: 37.5 },
    { ten: 'Cây', rate: 37.5 },
    { ten: 'Karat', rate: 0.2 },
    { ten: 'Phân', rate: 0.375 },
    { ten: 'Ly', rate: 0.0375 },
  ]

  for (const item of updates) {
    const result = await prisma.donViTinh.updateMany({
      where: { 
        tenDVT: { equals: item.ten, mode: 'insensitive' },
        dinhLuong: null 
      },
      data: { dinhLuong: item.rate }
    })
    if (result.count > 0) {
      console.log(`- Updated ${item.ten}: ${item.rate}g (${result.count} records)`)
    }
  }

  console.log('Update finished.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
