import { prisma } from "@/lib/prisma";
import { getBusinessDateParts, getBusinessDayBounds, type BusinessDateParts } from "@/lib/business-date";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
type RevenueDbClient = typeof prisma | TransactionClient;

export type ReportDateParts = BusinessDateParts;

export function getRevenueReportDateParts(date: Date): ReportDateParts {
  return getBusinessDateParts(date);
}

function getDayBounds(date: Date) {
  return getBusinessDayBounds(date);
}

function dateKey(parts: ReportDateParts) {
  return `${parts.nam}-${parts.thang}-${parts.ngay}`;
}

export function getReportDatesInRange(startDate: Date, endDate: Date): ReportDateParts[] {
  const dates: ReportDateParts[] = [];
  const startParts = getBusinessDateParts(startDate);
  const endParts = getBusinessDateParts(endDate);
  const cursor = new Date(Date.UTC(startParts.nam, startParts.thang - 1, startParts.ngay));
  const endTime = Date.UTC(endParts.nam, endParts.thang - 1, endParts.ngay);

  while (cursor.getTime() <= endTime) {
    dates.push({
      ngay: cursor.getUTCDate(),
      thang: cursor.getUTCMonth() + 1,
      nam: cursor.getUTCFullYear(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export async function syncBaoCaoDoanhThuForDate(db: RevenueDbClient, date: Date) {
  const reportDate = getRevenueReportDateParts(date);
  const { startDate, endDate } = getDayBounds(date);

  const [sales, services] = await Promise.all([
    db.phieuBanHang.aggregate({
      where: { ngayLap: { gte: startDate, lte: endDate } },
      _sum: { tongTien: true },
    }),
    db.phieuDichVu.aggregate({
      where: {
        ngayLap: { gte: startDate, lte: endDate },
        tinhTrang: "HoanThanh",
        chiTietDichVu: {
          some: {},
          every: { ngayGiao: { not: null } },
        },
      },
      _sum: { tongTien: true },
    }),
  ]);

  const dtBanHang = Number(sales._sum.tongTien ?? 0);
  const dtDichVu = Number(services._sum.tongTien ?? 0);
  const tongDT = dtBanHang + dtDichVu;
  const where = { ngay_thang_nam: reportDate };

  if (tongDT === 0) {
    const current = await db.baoCaoDoanhThu.findUnique({ where });
    if (!current) return null;
    return db.baoCaoDoanhThu.update({
      where,
      data: { dtBanHang: 0, dtDichVu: 0, tongDT: 0 },
    });
  }

  return db.baoCaoDoanhThu.upsert({
    where,
    create: {
      ...reportDate,
      dtBanHang,
      dtDichVu,
      tongDT,
    },
    update: {
      dtBanHang,
      dtDichVu,
      tongDT,
    },
  });
}

export async function syncBaoCaoDoanhThuForDates(db: RevenueDbClient, dates: ReportDateParts[]) {
  const seen = new Set<string>();

  for (const parts of dates) {
    const key = dateKey(parts);
    if (seen.has(key)) continue;
    seen.add(key);
    await syncBaoCaoDoanhThuForDate(db, new Date(Date.UTC(parts.nam, parts.thang - 1, parts.ngay)));
  }
}

export async function syncBaoCaoDoanhThuForRange(startDate: Date, endDate: Date) {
  await syncBaoCaoDoanhThuForDates(prisma, getReportDatesInRange(startDate, endDate));
}
