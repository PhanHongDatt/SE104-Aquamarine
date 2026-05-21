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

// ── Loại Sản Phẩm ─────────────────────────────────────────────
export async function getDanhSachLoaiSanPham(): Promise<LoaiSanPham[]> {
  const data = await prisma.loaiSanPham.findMany({
    include: { donViTinh: true },
    orderBy: { maLSP: 'asc' }
  });
  return serialize(data);
}

// ── Nhà Cung Cấp ──────────────────────────────────────────────
export async function getDanhSachNhaCungCap(): Promise<NhaCungCap[]> {
  const data = await prisma.nhaCungCap.findMany({
    orderBy: { maNCC: 'asc' }
  });
  return serialize(data);
}

// ── Sản Phẩm ──────────────────────────────────────────────────
export async function getDanhSachSanPham(): Promise<SanPham[]> {
  const data = await prisma.sanPham.findMany({
    where: { deletedAt: null },
    include: { loaiSanPham: true, donViTinh: true },
    orderBy: { maSP: 'asc' }
  });
  return serialize(data);
}
