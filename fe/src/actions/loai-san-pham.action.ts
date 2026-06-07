"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { loaiSanPhamSchema, type LoaiSanPhamInput } from "@/schemas/loai-san-pham.schema";
import { calculateSellPrice } from "@/lib/business-rules";
import { nextSequentialIdFromValidCodes, withUniqueRetry } from "@/lib/id-generation";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";

async function canManageLoaiSanPham(hanhDong: string = ACTIONS.VIEW) {
  const session = await getServerSession(authOptions);
  return hasPermission(PERMISSIONS.LOAI_SAN_PHAM, hanhDong, session);
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function generateCategoryId() {
  const records = await prisma.loaiSanPham.findMany({
    where: { maLSP: { startsWith: "LSP" } },
    select: { maLSP: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.maLSP), "LSP", 3);
}

async function isValidUnit(maDVT: string) {
  const unit = await prisma.donViTinh.findUnique({
    where: { maDVT },
    select: { maDVT: true },
  });
  return !!unit;
}

// 2. Lấy danh sách
export async function getLoaiSanPhams() {
  try {
    if (!(await canManageLoaiSanPham(ACTIONS.VIEW))) {
      return { success: false, message: "Bạn không có quyền xem loại sản phẩm", data: [] };
    }
    const data = await prisma.loaiSanPham.findMany({
      include: { donViTinh: true },
      orderBy: { maLSP: "asc" },
    });
    return { success: true, data: serialize(data) };
  } catch (error: any) {
    return { success: false, message: "Không thể lấy danh sách loại sản phẩm" };
  }
}

// 3. Thêm mới Loại sản phẩm
export async function createLoaiSanPham(data: LoaiSanPhamInput) {
  try {
    if (!(await canManageLoaiSanPham(ACTIONS.CREATE))) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    const validated = loaiSanPhamSchema.parse(data);

    if (!(await isValidUnit(validated.maDVT))) {
      return { success: false, message: "Đơn vị tính không hợp lệ" };
    }

    // Kiểm tra trùng tên (không phân biệt hoa/thường)
    const existing = await prisma.loaiSanPham.findFirst({
      where: { tenLSP: { equals: validated.tenLSP, mode: "insensitive" } },
    });
    if (existing) {
      return { success: false, message: "Tên loại sản phẩm đã tồn tại" };
    }

    const record = await withUniqueRetry(async () => {
      const newId = await generateCategoryId();

      return prisma.loaiSanPham.create({
        data: {
          maLSP: newId,
          tenLSP: validated.tenLSP,
          maDVT: validated.maDVT,
          phanTramLoiNhuan: validated.phanTramLoiNhuan,
        },
      });
    });

    revalidatePath("/admin/danh-muc/loai-san-pham");
    return { success: true, message: "Thêm loại sản phẩm thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống khi thêm mới" };
  }
}

// 4. Sửa Loại sản phẩm & Tự động tính lại giá bán
export async function updateLoaiSanPham(maLSP: string, data: LoaiSanPhamInput) {
  try {
    if (!(await canManageLoaiSanPham(ACTIONS.UPDATE))) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    const validated = loaiSanPhamSchema.parse(data);

    if (!(await isValidUnit(validated.maDVT))) {
      return { success: false, message: "Đơn vị tính không hợp lệ" };
    }

    // Kiểm tra trùng tên (không phân biệt hoa/thường, trừ chính nó)
    const existing = await prisma.loaiSanPham.findFirst({
      where: { tenLSP: { equals: validated.tenLSP, mode: "insensitive" }, NOT: { maLSP: maLSP } },
    });
    if (existing) {
      return { success: false, message: "Tên loại sản phẩm đã tồn tại" };
    }

    // Thực hiện cập nhật trong Transaction
    await prisma.$transaction(async (tx) => {
      // Lấy dữ liệu cũ để so sánh % lợi nhuận
      const oldRecord = await tx.loaiSanPham.findUnique({ where: { maLSP } });
      
      // Cập nhật loại sản phẩm
      await tx.loaiSanPham.update({
        where: { maLSP },
        data: {
          tenLSP: validated.tenLSP,
          maDVT: validated.maDVT,
          phanTramLoiNhuan: validated.phanTramLoiNhuan,
        },
      });

      if (oldRecord && oldRecord.maDVT !== validated.maDVT) {
        await tx.sanPham.updateMany({
          where: { maLSP, deletedAt: null },
          data: { maDVT: validated.maDVT },
        });
      }

      // RÀNG BUỘC QUAN TRỌNG: Nếu % lợi nhuận thay đổi, tính lại giá bán cho toàn bộ SP thuộc loại này
      if (oldRecord && Number(oldRecord.phanTramLoiNhuan) !== validated.phanTramLoiNhuan) {
        const products = await tx.sanPham.findMany({ where: { maLSP, deletedAt: null } });
        
        for (const sp of products) {
          const newGiaBan = calculateSellPrice(Number(sp.donGiaNhap), validated.phanTramLoiNhuan);
          await tx.sanPham.update({
            where: { maSP: sp.maSP },
            data: { donGiaBan: newGiaBan }
          });
        }
      }
    });

    revalidatePath("/admin/danh-muc/loai-san-pham");
    revalidatePath("/admin/danh-muc/san-pham"); // Revalidate luôn trang sản phẩm vì giá đã đổi
    return { success: true, message: "Cập nhật thành công và đã tính lại giá bán cho các sản phẩm liên quan" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống khi cập nhật" };
  }
}

// 5. Xóa Loại sản phẩm
export async function deleteLoaiSanPham(maLSP: string) {
  try {
    if (!(await canManageLoaiSanPham(ACTIONS.DELETE))) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    // Kiểm tra xem có sản phẩm nào đang thuộc loại này không
    const usedInSP = await prisma.sanPham.findMany({
      where: { maLSP, deletedAt: null },
      select: { maSP: true, tenSP: true },
      orderBy: { maSP: "asc" },
    });
    if (usedInSP.length > 0) {
      const spList = usedInSP.map((sp) => `${sp.maSP} - ${sp.tenSP}`).join(", ");
      return {
        success: false,
        message: `Không thể xóa loại sản phẩm đang chứa ${usedInSP.length} sản phẩm: ${spList}`,
      };
    }

    await prisma.loaiSanPham.delete({ where: { maLSP } });

    revalidatePath("/admin/danh-muc/loai-san-pham");
    return { success: true, message: "Xóa loại sản phẩm thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi hệ thống khi xóa dữ liệu" };
  }
}
