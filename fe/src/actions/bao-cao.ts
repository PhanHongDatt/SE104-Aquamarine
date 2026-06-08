'use server';

import { prisma } from '@/lib/prisma';

export interface BaoCaoDoanhThuItem {
  ngay: number;
  thang: number;
  nam: number;
  dtBanHang: number;
  dtDichVu: number;
  tongDT: number;
}

export interface BaoCaoTonKhoItem {
  ngay: number;
  thang: number;
  nam: number;
  maSP: string;
  tonDau: number;
  slMuaVao: number;
  slBanRa: number;
  tonCuoi: number;
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";
import { getReportDatesInRange, syncBaoCaoDoanhThuForRange } from "@/lib/revenue-report-sync";
import {
  formatBusinessDateParts,
  getBusinessDayBounds,
  getBusinessMonthBounds,
  getBusinessQuarterBounds,
  parseBusinessDateInput,
} from "@/lib/business-date";

export interface BaoCaoDoanhThuDetailedResult {
  dailyData: BaoCaoDoanhThuItem[];
  tongDTBanHang: number;
  tongDTDichVu: number;
  tongCong: number;
  periodLabel: string;
}

export type ReportPeriodType = "day" | "month" | "quarter";

function getReportPeriod(
  thang: number,
  nam: number,
  periodType: ReportPeriodType = "month",
  selectedDay?: string,
  selectedQuarter?: number
) {
  if (periodType === "day") {
    const dayParts = selectedDay ? parseBusinessDateInput(selectedDay) : { ngay: 1, thang, nam };
    const { startDate, endDate } = getBusinessDayBounds(dayParts);
    return {
      startDate,
      endDate,
      label: `Ngày ${formatBusinessDateParts(dayParts)}`,
    };
  }

  if (periodType === "quarter") {
    const quarter = selectedQuarter ?? Math.ceil(thang / 3);
    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
      throw new Error("Quý báo cáo không hợp lệ");
    }
    const { startDate, endDate } = getBusinessQuarterBounds(quarter, nam);
    return {
      startDate,
      endDate,
      label: `Quý ${quarter} Năm ${nam}`,
    };
  }

  const { startDate, endDate } = getBusinessMonthBounds(thang, nam);
  return {
    startDate,
    endDate,
    label: `Tháng ${thang} Năm ${nam}`,
  };
}

export async function getBaoCaoDoanhThuDetailed(
  thang: number,
  nam: number,
  periodType: ReportPeriodType = "month",
  selectedDay?: string,
  selectedQuarter?: number
): Promise<BaoCaoDoanhThuDetailedResult> {
  try {
	    const session = await getServerSession(authOptions) as any;
	    if (!(await hasPermission(PERMISSIONS.BAO_CAO_DOANH_THU, ACTIONS.VIEW, session))) {
	      throw new Error("Từ chối truy cập: Bạn không có quyền xem báo cáo doanh thu");
	    }

    const { startDate, endDate, label } = getReportPeriod(thang, nam, periodType, selectedDay, selectedQuarter);
    const reportDates = getReportDatesInRange(startDate, endDate);

    await syncBaoCaoDoanhThuForRange(startDate, endDate);

    const reportRows = await prisma.baoCaoDoanhThu.findMany({
      where: { OR: reportDates },
      orderBy: [{ nam: "asc" }, { thang: "asc" }, { ngay: "asc" }],
    });

    const dailyData = reportRows
      .map((row) => ({
        ngay: row.ngay,
        thang: row.thang,
        nam: row.nam,
        dtBanHang: Number(row.dtBanHang),
        dtDichVu: Number(row.dtDichVu),
        tongDT: Number(row.tongDT),
      }))
      .filter((row) => row.dtBanHang > 0 || row.dtDichVu > 0 || row.tongDT > 0);

    // Tính tổng kết
    const tongDTBanHang = dailyData.reduce((sum, item) => sum + Number(item.dtBanHang), 0);
    const tongDTDichVu = dailyData.reduce((sum, item) => sum + Number(item.dtDichVu), 0);
    const tongCong = tongDTBanHang + tongDTDichVu;

    return serialize({
      dailyData,
      tongDTBanHang,
      tongDTDichVu,
      tongCong,
      periodLabel: label,
    });
  } catch (error) {
    console.error("[getBaoCaoDoanhThuDetailed] Error:", error);
    throw new Error("Lỗi khi tính toán báo cáo doanh thu");
  }
}

export interface BaoCaoTonKhoDetailedItem {
  maSP: string;
  tenSP: string;
  tenDVT: string;
  maLSP: string;
  tenLSP: string;
  hamLuong: string;
  tonDau: number;
  slMuaVao: number;
  slBanRa: number;
  tonCuoi: number;
  tonToiThieu: number;
  canhBao: boolean;
}

export async function getBaoCaoTonKhoDetailed(
  thang: number,
  nam: number,
  periodType: ReportPeriodType = "month",
  selectedDay?: string,
  selectedQuarter?: number
): Promise<BaoCaoTonKhoDetailedItem[]> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.BAO_CAO_TON_KHO, ACTIONS.VIEW, session))) {
      throw new Error("Từ chối truy cập: Bạn không có quyền xem báo cáo tồn kho");
    }

    const [products, settings] = await Promise.all([
      prisma.sanPham.findMany({
        where: { deletedAt: null },
        include: { donViTinh: true, loaiSanPham: true }
      }),
      prisma.thamSo.findUnique({
        where: { id: 1 },
        select: { soLuongTonKhoToiThieu: true },
      }),
    ]);
    const tonToiThieuQuyDinh = settings?.soLuongTonKhoToiThieu ?? 0;

    const reportData: BaoCaoTonKhoDetailedItem[] = [];

    // Xác định khoảng thời gian
    const { startDate, endDate } = getReportPeriod(thang, nam, periodType, selectedDay, selectedQuarter);

    for (const p of products) {
      // 3.1: Tổng mua vào trong tháng
      const muaVao = await prisma.chiTietMuaHang.aggregate({
        where: {
          maSP: p.maSP,
          phieuMuaHang: { ngayLap: { gte: startDate, lte: endDate } }
        },
        _sum: { soLuong: true }
      });
      const slMuaVao = muaVao._sum.soLuong || 0;

      // 3.2: Tổng bán ra trong tháng
      const banRa = await prisma.chiTietBanHang.aggregate({
        where: {
          maSP: p.maSP,
          phieuBanHang: { ngayLap: { gte: startDate, lte: endDate } }
        },
        _sum: { soLuong: true }
      });
      const slBanRa = banRa._sum.soLuong || 0;

      const productCreatedAfterReport = p.createdAt > endDate;
      let tonCuoi = 0;
      let tonDau = 0;

      if (!productCreatedAfterReport) {
        const [muaSauKy, banSauKy] = await Promise.all([
          prisma.chiTietMuaHang.aggregate({
            where: {
              maSP: p.maSP,
              phieuMuaHang: { ngayLap: { gt: endDate } },
            },
            _sum: { soLuong: true },
          }),
          prisma.chiTietBanHang.aggregate({
            where: {
              maSP: p.maSP,
              phieuBanHang: { ngayLap: { gt: endDate } },
            },
            _sum: { soLuong: true },
          }),
        ]);

        const slMuaSauKy = muaSauKy._sum.soLuong || 0;
        const slBanSauKy = banSauKy._sum.soLuong || 0;

        // Tồn cuối kỳ = tồn hiện tại - mua sau kỳ + bán sau kỳ.
        tonCuoi = Number(p.tonKho) - Number(slMuaSauKy) + Number(slBanSauKy);
        tonDau = tonCuoi - Number(slMuaVao) + Number(slBanRa);
      }

      const canhBao = !productCreatedAfterReport && Number(tonCuoi) < tonToiThieuQuyDinh;

      reportData.push({
        maSP: p.maSP,
        tenSP: p.tenSP,
        tenDVT: p.donViTinh.tenDVT,
        maLSP: p.maLSP,
        tenLSP: p.loaiSanPham.tenLSP,
        hamLuong: p.hamLuong,
        tonDau,
        slMuaVao,
        slBanRa,
        tonCuoi,
        tonToiThieu: tonToiThieuQuyDinh,
        canhBao
      });
    }

    return serialize(reportData);
  } catch (error) {
    console.error("[getBaoCaoTonKhoDetailed] Error:", error);
    throw new Error("Lỗi khi tính toán báo cáo tồn kho");
  }
}
