import { prisma } from "@/lib/prisma";

export class ReportService {
  static async getMonthlyRevenue(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const transactions = await prisma.phieuBanHang.aggregate({
      _sum: {
        tongTien: true
      },
      where: {
        ngayLap: {
          gte: start,
          lte: end
        }
      }
    });

    return transactions._sum.tongTien ? Number(transactions._sum.tongTien) : 0;
  }
}
