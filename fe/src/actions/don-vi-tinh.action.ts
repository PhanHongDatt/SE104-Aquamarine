"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { donViTinhSchema, type DonViTinhInput } from "@/schemas/don-vi-tinh.schema";
import { nextSequentialIdFromValidCodes, withUniqueRetry } from "@/lib/id-generation";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";

async function canManageDonViTinh(hanhDong: string = ACTIONS.VIEW) {
  const session = await getServerSession(authOptions);
  return hasPermission(PERMISSIONS.DON_VI_TINH, hanhDong, session);
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function generateUnitId() {
  const records = await prisma.donViTinh.findMany({
    where: { maDVT: { startsWith: "DVT" } },
    select: { maDVT: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.maDVT), "DVT", 3);
}

export async function getDonViTinhs() {
  try {
    const data = await prisma.donViTinh.findMany({
      include: {
        loaiSanPham: {
          select: { tenLSP: true },
          orderBy: { tenLSP: "asc" },
        },
        sanPham: {
          where: { deletedAt: null },
          select: { tenSP: true },
          orderBy: { tenSP: "asc" },
        },
      },
      orderBy: { maDVT: "asc" },
    });
    const mapped = data.map((item) => {
      const appliedNames = Array.from(
        new Set([
          ...item.loaiSanPham.map((lsp) => lsp.tenLSP),
          ...item.sanPham.map((sp) => sp.tenSP),
        ])
      );
      const dinhLuong = item.dinhLuong ? Number(item.dinhLuong) : null;
      const unitName = item.tenDVT.toLowerCase();
      const ghiChu = unitName.includes("lượng")
        ? "1 Lượng = 10 chỉ = 37,5 gram"
        : unitName.includes("chỉ")
          ? "1 Chỉ = 3,75 gram"
          : dinhLuong
            ? `1 ${item.tenDVT} = ${dinhLuong.toLocaleString("vi-VN")} gram`
            : "";

      return {
        ...item,
        sanPhamApDung: appliedNames.join(", "),
        ghiChu,
      };
    });
    return { success: true, data: serialize(mapped) };
  } catch (error: any) {
    console.error("[Prisma Error] getDonViTinhs:", error);
    return { success: false, message: `Lỗi DB: ${error.message || "Không xác định"}` };
  }
}

export async function createDonViTinh(data: DonViTinhInput) {
  try {
    if (!(await canManageDonViTinh(ACTIONS.CREATE))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const validated = donViTinhSchema.parse(data);

    // Kiểm tra trùng tên (không phân biệt hoa/thường)
    const existing = await prisma.donViTinh.findFirst({
      where: { tenDVT: { equals: validated.tenDVT, mode: "insensitive" } },
    });
    if (existing) {
      return { success: false, message: "Tên đơn vị tính đã tồn tại" };
    }

    const record = await withUniqueRetry(async () => {
      const newId = await generateUnitId();

      return prisma.donViTinh.create({
        data: {
          maDVT: newId,
          tenDVT: validated.tenDVT,
          dinhLuong: validated.dinhLuong,
        },
      });
    });

    revalidatePath("/admin/danh-muc/don-vi-tinh");
    revalidatePath("/nhan-vien/danh-muc/don-vi-tinh");
    return { success: true, message: "Thêm đơn vị tính thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống" };
  }
}

export async function updateDonViTinh(maDVT: string, data: DonViTinhInput) {
  try {
    if (!(await canManageDonViTinh(ACTIONS.UPDATE))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const validated = donViTinhSchema.parse(data);

    // Kiểm tra trùng tên (không phân biệt hoa/thường)
    const existing = await prisma.donViTinh.findFirst({
      where: { tenDVT: { equals: validated.tenDVT, mode: "insensitive" }, NOT: { maDVT: maDVT } },
    });
    if (existing) {
      return { success: false, message: "Tên đơn vị tính đã tồn tại" };
    }

    const record = await prisma.donViTinh.update({
      where: { maDVT },
      data: { 
        tenDVT: validated.tenDVT,
        dinhLuong: validated.dinhLuong,
      },
    });

    revalidatePath("/admin/danh-muc/don-vi-tinh");
    revalidatePath("/nhan-vien/danh-muc/don-vi-tinh");
    return { success: true, message: "Cập nhật thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống" };
  }
}

export async function deleteDonViTinh(maDVT: string) {
  try {
    if (!(await canManageDonViTinh(ACTIONS.DELETE))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const usedInLSP = await prisma.loaiSanPham.findFirst({ where: { maDVT } });
    const usedInSP = await prisma.sanPham.findFirst({ where: { maDVT, deletedAt: null } });

    if (usedInLSP || usedInSP) {
      return { 
        success: false, 
        message: "Không thể xóa đơn vị tính này vì đang được sử dụng bởi Sản phẩm hoặc Loại sản phẩm." 
      };
    }

    await prisma.donViTinh.delete({ where: { maDVT } });

    revalidatePath("/admin/danh-muc/don-vi-tinh");
    revalidatePath("/nhan-vien/danh-muc/don-vi-tinh");
    return { success: true, message: "Xóa đơn vị tính thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi xóa dữ liệu" };
  }
}
