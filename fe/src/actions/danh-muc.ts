'use server';

import { prisma } from '@/lib/prisma';
import type { DonViTinh, LoaiSanPham, NhaCungCap, SanPham } from '@/types/model';

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// ── Đơn Vị Tính ──────────────────────────────────────────────
export async function getDanhSachDonViTinh(): Promise<DonViTinh[]> {
  const data = await prisma.donViTinh.findMany({
    orderBy: { maDVT: 'asc' }
  });
  return serialize(data);
}

export async function themDonViTinh(data: DonViTinh): Promise<DonViTinh> {
  const record = await prisma.donViTinh.create({
    data
  });
  return serialize(record);
}

// ── Loại Sản Phẩm ─────────────────────────────────────────────
export async function getDanhSachLoaiSanPham(): Promise<LoaiSanPham[]> {
  const data = await prisma.loaiSanPham.findMany({
    include: { donViTinh: true },
    orderBy: { maLSP: 'asc' }
  });
  return serialize(data);
}

export async function themLoaiSanPham(data: Omit<LoaiSanPham, 'donViTinh'>): Promise<LoaiSanPham> {
  const record = await prisma.loaiSanPham.create({
    data: {
      maLSP: data.maLSP,
      tenLSP: data.tenLSP,
      maDVT: data.maDVT,
      phanTramLoiNhuan: data.phanTramLoiNhuan
    },
    include: { donViTinh: true }
  });
  return serialize(record);
}

// ── Nhà Cung Cấp ──────────────────────────────────────────────
export async function getDanhSachNhaCungCap(): Promise<NhaCungCap[]> {
  const data = await prisma.nhaCungCap.findMany({
    orderBy: { maNCC: 'asc' }
  });
  return serialize(data);
}

export async function themNhaCungCap(data: NhaCungCap): Promise<{ success: boolean; message: string; data?: NhaCungCap }> {
  try {
    const record = await prisma.nhaCungCap.create({
      data
    });
    return {
      success: true,
      message: "Thêm nhà cung cấp thành công",
      data: serialize(record)
    };
  } catch (error: any) {
    console.error("[themNhaCungCap] Error:", error);
    return {
      success: false,
      message: error.code === 'P2002' ? "Mã nhà cung cấp đã tồn tại" : "Lỗi khi thêm nhà cung cấp"
    };
  }
}

export async function capNhatNhaCungCap(maNCC: string, data: Partial<NhaCungCap>): Promise<{ success: boolean; message: string; data?: NhaCungCap }> {
  try {
    const record = await prisma.nhaCungCap.update({
      where: { maNCC },
      data: {
        tenNCC: data.tenNCC,
        diaChi: data.diaChi,
        soDienThoai: data.soDienThoai,
        nguoiLienHe: data.nguoiLienHe
      }
    });
    return {
      success: true,
      message: "Cập nhật nhà cung cấp thành công",
      data: serialize(record)
    };
  } catch (error) {
    console.error("[capNhatNhaCungCap] Error:", error);
    return {
      success: false,
      message: "Lỗi khi cập nhật nhà cung cấp"
    };
  }
}

// ── Sản Phẩm ──────────────────────────────────────────────────
export async function getDanhSachSanPham(): Promise<SanPham[]> {
  const data = await prisma.sanPham.findMany({
    include: { loaiSanPham: true, donViTinh: true },
    orderBy: { maSP: 'asc' }
  });
  return serialize(data);
}

export async function themSanPham(data: Omit<SanPham, 'loaiSanPham' | 'donViTinh'>): Promise<SanPham> {
  const record = await prisma.sanPham.create({
    data: {
      maSP: data.maSP,
      tenSP: data.tenSP,
      maLSP: data.maLSP,
      hamLuong: data.hamLuong as any,
      trongLuong: data.trongLuong,
      maDVT: data.maDVT,
      tonToiThieu: data.tonToiThieu,
      tonKho: data.tonKho,
      donGiaNhap: data.donGiaNhap,
      donGiaBan: data.donGiaBan
    },
    include: { loaiSanPham: true, donViTinh: true }
  });
  return serialize(record);
}
