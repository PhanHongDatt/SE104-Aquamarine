"use server";

import { prisma } from "@/lib/prisma";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function createSanPham(data: any) {
  const record = await prisma.sanPham.create({ data });
  return serialize(record);
}

export async function getDanhSachNhaCungCap() {
  const data = await prisma.nhaCungCap.findMany({
    orderBy: { maNCC: 'asc' }
  });
  return serialize(data);
}

export async function getDanhSachDonViTinh() {
  const data = await prisma.donViTinh.findMany({
    orderBy: { maDVT: 'asc' }
  });
  return serialize(data);
}

export async function getDanhSachLoaiSanPham() {
  const data = await prisma.loaiSanPham.findMany({
    include: { donViTinh: true },
    orderBy: { maLSP: 'asc' }
  });
  return serialize(data);
}
