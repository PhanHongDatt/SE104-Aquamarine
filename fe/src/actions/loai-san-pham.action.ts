"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { loaiSanPhamSchema, type LoaiSanPhamInput } from "@/schemas/loai-san-pham.schema";

async function checkIsAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "QUAN_LY";
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getLoaiSanPhams() {
  try {
    const data = await prisma.loaiSanPham.findMany({
      include: { donViTinh: true },
      orderBy: { maLSP: "asc" },
    });
    return { success: true, data: serialize(data) };
  } catch (error: any) {
    return { success: false, message: "Không thể lấy danh sách loại sản phẩm" };
  }
}

// Các hàm CRUD khác sẽ được triển khai logic chi tiết ở bước sau
export async function createLoaiSanPham(data: LoaiSanPhamInput) {
  return { success: false, message: "Đang triển khai logic..." };
}

export async function updateLoaiSanPham(maLSP: string, data: LoaiSanPhamInput) {
  return { success: false, message: "Đang triển khai logic..." };
}

export async function deleteLoaiSanPham(maLSP: string) {
  return { success: false, message: "Đang triển khai logic..." };
}
