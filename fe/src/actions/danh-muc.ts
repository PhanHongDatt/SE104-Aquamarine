'use server';

import { prisma } from '@/lib/prisma';
import type { DonViTinh, LoaiSanPham, NhaCungCap, SanPham } from '@/types/model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ACTIONS, hasPermission, PERMISSIONS } from '@/lib/permissions';

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function requireAnyPermission(checks: Array<[string, string]>) {
  const session = await getServerSession(authOptions);
  for (const [feature, action] of checks) {
    if (await hasPermission(feature, action, session)) return;
  }
  throw new Error('Bạn không có quyền truy cập dữ liệu này');
}

// ── Đơn Vị Tính ──────────────────────────────────────────────
export async function getDanhSachDonViTinh(): Promise<DonViTinh[]> {
  await requireAnyPermission([
    [PERMISSIONS.DON_VI_TINH, ACTIONS.VIEW],
    [PERMISSIONS.LOAI_SAN_PHAM, ACTIONS.VIEW],
    [PERMISSIONS.SAN_PHAM, ACTIONS.VIEW],
  ]);
  const data = await prisma.donViTinh.findMany({
    orderBy: { maDVT: 'asc' }
  });
  return serialize(data);
}

// ── Loại Sản Phẩm ─────────────────────────────────────────────
export async function getDanhSachLoaiSanPham(): Promise<LoaiSanPham[]> {
  await requireAnyPermission([
    [PERMISSIONS.LOAI_SAN_PHAM, ACTIONS.VIEW],
    [PERMISSIONS.SAN_PHAM, ACTIONS.VIEW],
  ]);
  const data = await prisma.loaiSanPham.findMany({
    include: { donViTinh: true },
    orderBy: { maLSP: 'asc' }
  });
  return serialize(data);
}

// ── Nhà Cung Cấp ──────────────────────────────────────────────
export async function getDanhSachNhaCungCap(): Promise<NhaCungCap[]> {
  await requireAnyPermission([
    [PERMISSIONS.NHA_CUNG_CAP, ACTIONS.VIEW],
    [PERMISSIONS.MUA_HANG, ACTIONS.VIEW],
    [PERMISSIONS.MUA_HANG, ACTIONS.CREATE],
  ]);
  const data = await prisma.nhaCungCap.findMany({
    orderBy: { maNCC: 'asc' }
  });
  return serialize(data);
}

// ── Sản Phẩm ──────────────────────────────────────────────────
export async function getDanhSachSanPham(): Promise<SanPham[]> {
  await requireAnyPermission([
    [PERMISSIONS.SAN_PHAM, ACTIONS.VIEW],
    [PERMISSIONS.BAN_HANG, ACTIONS.VIEW],
    [PERMISSIONS.BAN_HANG, ACTIONS.CREATE],
    [PERMISSIONS.MUA_HANG, ACTIONS.VIEW],
    [PERMISSIONS.MUA_HANG, ACTIONS.CREATE],
  ]);
  const data = await prisma.sanPham.findMany({
    where: { deletedAt: null },
    include: { loaiSanPham: true, donViTinh: true },
    orderBy: { maSP: 'asc' }
  });
  return serialize(data);
}
