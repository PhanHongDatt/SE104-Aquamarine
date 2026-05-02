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

export interface BaoCaoDoanhThuDetailedResult {
  dailyData: BaoCaoDoanhThuItem[];
  tongDTBanHang: number;
  tongDTDichVu: number;
  tongCong: number;
}

export async function getBaoCaoDoanhThuDetailed(thang: number, nam: number): Promise<BaoCaoDoanhThuDetailedResult> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
      throw new Error("Từ chối truy cập: Chỉ Quản lý mới có quyền xem báo cáo doanh thu");
    }

    // Truy vấn dữ liệu từ bảng BaoCaoDoanhThu (dữ liệu này đã được cập nhật bởi các Transaction khi lập phiếu)
    const dailyData = await prisma.baoCaoDoanhThu.findMany({
      where: { thang, nam },
      orderBy: { ngay: 'asc' }
    });

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
    const userRole = session?.user?.role;
    
    if (userRole !== "QUAN_LY" && userRole !== "NHAN_VIEN") {
      throw new Error("Từ chối truy cập: Bạn không có quyền xem báo cáo tồn kho");
    }

    // 1. Lấy danh sách tất cả sản phẩm
    const products = await prisma.sanPham.findMany({
      include: { loaiSanPham: { include: { donViTinh: true } } }
    });

    const reportData: BaoCaoTonKhoDetailedItem[] = [];

    // Xác định khoảng thời gian
    const startDate = new Date(nam, thang - 1, 1);
    const endDate = new Date(nam, thang, 0, 23, 59, 59);

    // Tháng trước
    const prevThang = thang === 1 ? 12 : thang - 1;
    const prevNam = thang === 1 ? nam - 1 : nam;

    for (const p of products) {
      // 3.1: Xác định tồn đầu kỳ (tồn cuối tháng trước)
      const prevReport = await prisma.baoCaoTonKho.findFirst({
        where: { maSP: p.maSP, thang: prevThang, nam: prevNam },
        orderBy: { ngay: 'desc' }
      });
      const tonDau = prevReport ? prevReport.tonCuoi : 0;

      // 3.2: Tính tổng mua vào trong tháng
      const muaVao = await prisma.chiTietMuaHang.aggregate({
        where: {
          maSP: p.maSP,
          phieuMuaHang: { ngayLap: { gte: startDate, lte: endDate } }
        },
        _sum: { soLuong: true }
      });
      const slMuaVao = muaVao._sum.soLuong || 0;

      // 3.3: Tính tổng bán ra trong tháng
      const banRa = await prisma.chiTietBanHang.aggregate({
        where: {
          maSP: p.maSP,
          phieuBanHang: { ngayLap: { gte: startDate, lte: endDate } }
        },
        _sum: { soLuong: true }
      });
      const slBanRa = banRa._sum.soLuong || 0;

      // 3.4: Tính tồn cuối
      const tonCuoi = tonDau + slMuaVao - slBanRa;

      // 3.5: Cảnh báo tồn thấp
      const tonToiThieu = p.tonToiThieu;
      const canhBao = tonCuoi < tonToiThieu;

      reportData.push({
        maSP: p.maSP,
        tenSP: p.tenSP,
        tenDVT: p.loaiSanPham.donViTinh.tenDVT,
        tonDau,
        slMuaVao,
        slBanRa,
        tonCuoi,
        tonToiThieu,
        canhBao
      });
    }

    return serialize(reportData);
  } catch (error) {
    console.error("[getBaoCaoTonKhoDetailed] Error:", error);
    throw new Error("Lỗi khi tính toán báo cáo tồn kho");
  }
}
