"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { loaiSanPhamSchema, type LoaiSanPhamInput } from "@/schemas/loai-san-pham.schema";

// 1. Kiểm tra quyền Quản lý
async function checkIsAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "QUAN_LY";
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// 2. Lấy danh sách
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

// 3. Thêm mới Loại sản phẩm
export async function createLoaiSanPham(data: LoaiSanPhamInput) {
  try {
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    const validated = loaiSanPhamSchema.parse(data);

    // Kiểm tra trùng tên
    const existing = await prisma.loaiSanPham.findUnique({
      where: { tenLSP: validated.tenLSP },
    });
    if (existing) {
      return { success: false, message: "Tên loại sản phẩm đã tồn tại" };
    }

    // Tự động sinh mã LSPxxx
    const lastRecord = await prisma.loaiSanPham.findFirst({
      orderBy: { maLSP: "desc" },
    });

    let newId = "LSP001";
    if (lastRecord) {
      const lastIdNum = parseInt(lastRecord.maLSP.replace("LSP", ""));
      newId = `LSP${(lastIdNum + 1).toString().padStart(3, "0")}`;
    }

    const record = await prisma.loaiSanPham.create({
      data: {
        maLSP: newId,
        tenLSP: validated.tenLSP,
        maDVT: validated.maDVT,
        phanTramLoiNhuan: validated.phanTramLoiNhuan,
      },
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
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    const validated = loaiSanPhamSchema.parse(data);

    // Kiểm tra trùng tên (trừ chính nó)
    const existing = await prisma.loaiSanPham.findFirst({
      where: { tenLSP: validated.tenLSP, NOT: { maLSP: maLSP } },
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

      // RÀNG BUỘC QUAN TRỌNG: Nếu % lợi nhuận thay đổi, tính lại giá bán cho toàn bộ SP thuộc loại này
      if (oldRecord && Number(oldRecord.phanTramLoiNhuan) !== validated.phanTramLoiNhuan) {
        const products = await tx.sanPham.findMany({ where: { maLSP } });
        
        for (const sp of products) {
          const newGiaBan = Number(sp.donGiaNhap) * (1 + validated.phanTramLoiNhuan / 100);
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
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    // Kiểm tra xem có sản phẩm nào đang thuộc loại này không
    const usedInSP = await prisma.sanPham.findFirst({ where: { maLSP } });
    if (usedInSP) {
      return { success: false, message: "Không thể xóa loại sản phẩm đang chứa sản phẩm" };
    }

    await prisma.loaiSanPham.delete({ where: { maLSP } });

    revalidatePath("/admin/danh-muc/loai-san-pham");
    return { success: true, message: "Xóa loại sản phẩm thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi hệ thống khi xóa dữ liệu" };
  }
}
