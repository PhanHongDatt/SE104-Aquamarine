"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { nextSequentialIdFromValidCodes, withUniqueRetry } from "@/lib/id-generation";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { nhaCungCapSchema, type NhaCungCapFormValues } from "@/schemas/nha-cung-cap.schema";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function requireSupplierPermission() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "QUAN_LY") {
    return { allowed: false, message: "Chỉ vai trò Quản lý mới có quyền quản lý nhà cung cấp" };
  }
  if (!(await hasPermission(PERMISSIONS.NHA_CUNG_CAP, session))) {
    return { allowed: false, message: "Bạn không có quyền quản lý nhà cung cấp" };
  }
  return { allowed: true, message: "" };
}

async function generateSupplierId() {
  const records = await prisma.nhaCungCap.findMany({
    where: { maNCC: { startsWith: "NCC" } },
    select: { maNCC: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.maNCC), "NCC", 3);
}

export async function createNhaCungCap(input: NhaCungCapFormValues) {
  try {
    const auth = await requireSupplierPermission();
    if (!auth.allowed) return { success: false, message: auth.message };

    const validated = nhaCungCapSchema.parse(input);
    const record = await withUniqueRetry(async () => {
      const maNCC = await generateSupplierId();
      return prisma.nhaCungCap.create({
        data: {
          maNCC,
          tenNCC: validated.tenNCC.trim(),
          diaChi: validated.diaChi.trim(),
          soDienThoai: validated.soDienThoai.trim(),
          nguoiLienHe: validated.nguoiLienHe.trim(),
        },
      });
    });

    revalidatePath("/admin/danh-muc/nha-cung-cap");
    revalidatePath("/nhan-vien/danh-muc/nha-cung-cap");
    return { success: true, message: "Thêm nhà cung cấp thành công", data: serialize(record) };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, message: "Nhà cung cấp đã tồn tại" };
    }
    return { success: false, message: error?.errors?.[0]?.message || error?.message || "Lỗi khi thêm nhà cung cấp" };
  }
}

export async function updateNhaCungCap(maNCC: string, input: NhaCungCapFormValues) {
  try {
    const auth = await requireSupplierPermission();
    if (!auth.allowed) return { success: false, message: auth.message };

    const validated = nhaCungCapSchema.parse(input);
    const record = await prisma.nhaCungCap.update({
      where: { maNCC },
      data: {
        tenNCC: validated.tenNCC.trim(),
        diaChi: validated.diaChi.trim(),
        soDienThoai: validated.soDienThoai.trim(),
        nguoiLienHe: validated.nguoiLienHe.trim(),
      },
    });

    revalidatePath("/admin/danh-muc/nha-cung-cap");
    revalidatePath("/nhan-vien/danh-muc/nha-cung-cap");
    return { success: true, message: "Cập nhật nhà cung cấp thành công", data: serialize(record) };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, message: "Nhà cung cấp đã tồn tại" };
    }
    return { success: false, message: error?.errors?.[0]?.message || error?.message || "Lỗi khi cập nhật nhà cung cấp" };
  }
}

export async function deleteNhaCungCap(maNCC: string) {
  try {
    const auth = await requireSupplierPermission();
    if (!auth.allowed) return { success: false, message: auth.message };

    const usedInPurchase = await prisma.phieuMuaHang.findFirst({ where: { maNCC } });
    if (usedInPurchase) {
      return { success: false, message: "Không thể xóa nhà cung cấp đã có phiếu mua hàng" };
    }

    await prisma.nhaCungCap.delete({ where: { maNCC } });
    revalidatePath("/admin/danh-muc/nha-cung-cap");
    revalidatePath("/nhan-vien/danh-muc/nha-cung-cap");
    return { success: true, message: "Xóa nhà cung cấp thành công" };
  } catch {
    return { success: false, message: "Lỗi khi xóa nhà cung cấp" };
  }
}
