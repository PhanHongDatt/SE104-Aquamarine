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

export interface BaoCaoDoanhThuDetailedResult {
  dailyData: BaoCaoDoanhThuItem[];
  tongDTBanHang: number;
  tongDTDichVu: number;
  tongCong: number;
}

export async function getBaoCaoDoanhThuDetailed(thang: number, nam: number): Promise<BaoCaoDoanhThuDetailedResult> {
  try {
	    const session = await getServerSession(authOptions);
	    if (!(await hasPermission(PERMISSIONS.BAO_CAO_DOANH_THU, ACTIONS.VIEW, session))) {
	      throw new Error("Từ chối truy cập: Bạn không có quyền xem báo cáo doanh thu");
	    }

    const startDate = new Date(nam, thang - 1, 1);
    const endDate = new Date(nam, thang, 0, 23, 59, 59);

    const [salesReceipts, serviceReceipts] = await Promise.all([
      prisma.phieuBanHang.findMany({
        where: { ngayLap: { gte: startDate, lte: endDate } },
        select: { ngayLap: true, tongTien: true },
      }),
	      prisma.phieuDichVu.findMany({
	        where: {
	          ngayLap: { gte: startDate, lte: endDate },
	          tinhTrang: "HoanThanh",
	          chiTietDichVu: {
	            every: { ngayGiao: { not: null } },
	          },
	        },
	        select: {
	          ngayLap: true,
	          tongTien: true,
	        },
	      }),
    ]);

    const dailyMap = new Map<number, BaoCaoDoanhThuItem>();

    for (const receipt of salesReceipts) {
      const ngay = receipt.ngayLap.getDate();
      const current = dailyMap.get(ngay) ?? { ngay, thang, nam, dtBanHang: 0, dtDichVu: 0, tongDT: 0 };
      current.dtBanHang += Number(receipt.tongTien);
      current.tongDT = current.dtBanHang + current.dtDichVu;
      dailyMap.set(ngay, current);
    }

	    for (const receipt of serviceReceipts) {
	      const ngay = receipt.ngayLap.getDate();
	      const current = dailyMap.get(ngay) ?? { ngay, thang, nam, dtBanHang: 0, dtDichVu: 0, tongDT: 0 };
      current.dtDichVu += Number(receipt.tongTien);
      current.tongDT = current.dtBanHang + current.dtDichVu;
      dailyMap.set(ngay, current);
    }

    const dailyData = Array.from(dailyMap.values()).sort((a, b) => a.ngay - b.ngay);

    // Tính tổng kết
    const tongDTBanHang = dailyData.reduce((sum, item) => sum + Number(item.dtBanHang), 0);
    const tongDTDichVu = dailyData.reduce((sum, item) => sum + Number(item.dtDichVu), 0);
    const tongCong = tongDTBanHang + tongDTDichVu;

    return serialize({
      dailyData,
      tongDTBanHang,
      tongDTDichVu,
      tongCong
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
  tonDau: number;
  slMuaVao: number;
  slBanRa: number;
  tonCuoi: number;
  tonToiThieu: number;
  canhBao: boolean;
}

export async function getBaoCaoTonKhoDetailed(thang: number, nam: number): Promise<BaoCaoTonKhoDetailedItem[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!(await hasPermission(PERMISSIONS.BAO_CAO_TON_KHO, ACTIONS.VIEW, session))) {
      throw new Error("Từ chối truy cập: Bạn không có quyền xem báo cáo tồn kho");
    }

    const products = await prisma.sanPham.findMany({
      where: { deletedAt: null },
      include: { donViTinh: true }
    });

    const reportData: BaoCaoTonKhoDetailedItem[] = [];

    // Xác định khoảng thời gian
    const startDate = new Date(nam, thang - 1, 1);
    const endDate = new Date(nam, thang, 0, 23, 59, 59);

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

      const canhBao = Number(tonCuoi) < p.tonToiThieu;

      reportData.push({
        maSP: p.maSP,
        tenSP: p.tenSP,
        tenDVT: p.donViTinh.tenDVT,
        tonDau,
        slMuaVao,
        slBanRa,
        tonCuoi,
        tonToiThieu: p.tonToiThieu,
        canhBao
      });
    }

    return serialize(reportData);
  } catch (error) {
    console.error("[getBaoCaoTonKhoDetailed] Error:", error);
    throw new Error("Lỗi khi tính toán báo cáo tồn kho");
  }
}
