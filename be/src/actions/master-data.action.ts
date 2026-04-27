"use server";

import { prisma } from "@/lib/prisma";

export async function createSanPham(data: any) {
  return await prisma.sanPham.create({ data });
}

export async function getDanhSachNhaCungCap() {
  return await prisma.nhaCungCap.findMany();
}
