'use server';

import { prisma } from '@/lib/prisma';
import type { PhieuBanHang, PhieuMuaHang } from '@/types/model';

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// ── Phiếu Bán Hàng ────────────────────────────────────────────
export async function getDanhSachPhieuBanHang(): Promise<PhieuBanHang[]> {
  const data = await prisma.phieuBanHang.findMany({
    include: { chiTietBanHang: { include: { sanPham: true } } },
    orderBy: { ngayLap: 'desc' }
  });
  return serialize(data);
}

export async function lapPhieuBanHang(
  data: Omit<PhieuBanHang, 'chiTietBanHang'> & {
    chiTietBanHang: { maSP: string; soLuong: number; donGia: number; thanhTien: number }[];
  }
): Promise<PhieuBanHang> {
  return await prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu bán hàng
    const phieu = await tx.phieuBanHang.create({
      data: {
        soPhieu: data.soPhieu,
        tenKhachHang: data.tenKhachHang,
        tongTien: data.tongTien,
        chiTietBanHang: {
          create: data.chiTietBanHang.map(ct => ({
            maSP: ct.maSP,
            soLuong: ct.soLuong,
            donGia: ct.donGia,
            thanhTien: ct.thanhTien
          }))
        }
      }
    });

    // 2. Cập nhật tồn kho cho từng sản phẩm
    for (const ct of data.chiTietBanHang) {
      const sp = await tx.sanPham.findUnique({ where: { maSP: ct.maSP } });
      if (!sp || sp.tonKho < ct.soLuong) {
        throw new Error(`Sản phẩm ${ct.maSP} không đủ tồn kho`);
      }
      await tx.sanPham.update({
        where: { maSP: ct.maSP },
        data: { tonKho: { decrement: ct.soLuong } }
      });
    }

    return serialize(phieu);
  });
}

// ── Phiếu Mua Hàng ────────────────────────────────────────────
export async function getDanhSachPhieuMuaHang(): Promise<PhieuMuaHang[]> {
  const data = await prisma.phieuMuaHang.findMany({
    include: { nhaCungCap: true, chiTietMuaHang: { include: { sanPham: true } } },
    orderBy: { ngayLap: 'desc' }
  });
  return serialize(data);
}

export async function lapPhieuMuaHang(
  data: Omit<PhieuMuaHang, 'nhaCungCap' | 'chiTietMuaHang'> & {
    chiTietMuaHang: { maSP: string; soLuong: number; donGia: number; thanhTien: number }[];
  }
): Promise<PhieuMuaHang> {
  return await prisma.$transaction(async (tx) => {
    const phieu = await tx.phieuMuaHang.create({
      data: {
        soPhieu: data.soPhieu,
        maNCC: data.maNCC,
        tongTien: data.tongTien,
        chiTietMuaHang: {
          create: data.chiTietMuaHang.map(ct => ({
            maSP: ct.maSP,
            soLuong: ct.soLuong,
            donGia: ct.donGia,
            thanhTien: ct.thanhTien
          }))
        }
      }
    });

    for (const ct of data.chiTietMuaHang) {
      await tx.sanPham.update({
        where: { maSP: ct.maSP },
        data: { tonKho: { increment: ct.soLuong } }
      });
    }

    return serialize(phieu);
  });
}
