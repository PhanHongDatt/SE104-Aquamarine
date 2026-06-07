"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanPhamSchema, type SanPhamInput } from "@/schemas/san-pham.schema";
import { assertDvtValidForLoaiSP, calculateSellPrice } from "@/lib/business-rules";
import { nextSequentialIdFromValidCodes, withUniqueRetry } from "@/lib/id-generation";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";

async function canManageSanPham(hanhDong: string = ACTIONS.VIEW) {
  const session = await getServerSession(authOptions) as any;
  return hasPermission(PERMISSIONS.SAN_PHAM, hanhDong, session);
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function generateProductId() {
  const records = await prisma.sanPham.findMany({
    where: { maSP: { startsWith: "SP" } },
    select: { maSP: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.maSP), "SP", 3);
}

// 2. Lấy danh sách sản phẩm
export async function getSanPhams() {
  try {
    if (!(await canManageSanPham(ACTIONS.VIEW))) {
      return { success: false, message: "Bạn không có quyền xem sản phẩm", data: [] };
    }
    const data = await prisma.sanPham.findMany({
      where: { deletedAt: null },
      include: { loaiSanPham: true, donViTinh: true },
      orderBy: { maSP: "asc" },
    });
    return { success: true, data: serialize(data) };
  } catch (error: any) {
    return { success: false, message: "Không thể lấy danh sách sản phẩm" };
  }
}

// 3. Thêm mới Sản phẩm (Thuật toán 2.2.3.4)
export async function createSanPham(data: SanPhamInput) {
  try {
    if (!(await canManageSanPham(ACTIONS.CREATE))) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    // Bước 2: Validate dữ liệu (Zod)
    const validated = sanPhamSchema.parse(data);

    // Bước 3: Lấy thông tin loại sản phẩm để lấy % lợi nhuận
    const [category, donViTinh, thamSo] = await Promise.all([
      prisma.loaiSanPham.findUnique({ where: { maLSP: validated.maLSP } }),
      prisma.donViTinh.findUnique({ where: { maDVT: validated.maDVT } }),
      prisma.thamSo.findUnique({ where: { id: 1 } }),
    ]);
    if (!category) return { success: false, message: "Loại sản phẩm không hợp lệ" };
    if (!donViTinh) return { success: false, message: "Đơn vị tính không hợp lệ" };
    assertDvtValidForLoaiSP(category.tenLSP, donViTinh.tenDVT);
    if (validated.maDVT !== category.maDVT) {
      return { success: false, message: "Sản phẩm phải dùng đơn vị tính mặc định của loại sản phẩm" };
    }

    // Bước 7: Tự động tính đơn giá bán
    // Đơn giá bán = Đơn giá nhập × (1 + % Lợi nhuận / 100)
    const giaBan = calculateSellPrice(Number(validated.donGiaNhap), Number(category.phanTramLoiNhuan));

    // Bước 10: Lưu bản ghi
    const record = await withUniqueRetry(async () => {
      const newId = await generateProductId();

      return prisma.sanPham.create({
        data: {
          maSP: newId,
          tenSP: validated.tenSP,
          maLSP: validated.maLSP,
          hamLuong: validated.hamLuong as any,
          trongLuong: validated.trongLuong,
          maDVT: validated.maDVT,
          tonKho: 0, // Mặc định khi tạo mới là 0, sẽ nhập qua phiếu mua sau
          tonToiThieu: validated.tonToiThieu ?? thamSo?.soLuongTonKhoToiThieu ?? 1,
          donGiaNhap: validated.donGiaNhap,
          donGiaBan: giaBan,
        },
      });
    });

    revalidatePath("/admin/danh-muc/san-pham");
    return { success: true, message: `Thêm sản phẩm thành công với mã ${record.maSP}`, data: serialize(record) };
  } catch (error: any) {
    console.error("Create SP Error:", error);
    return { success: false, message: error.message || "Lỗi hệ thống khi tạo sản phẩm" };
  }
}

// 4. Sửa Sản phẩm (Thuật toán 2.2.3.5)
export async function updateSanPham(maSP: string, data: SanPhamInput) {
  try {
    if (!(await canManageSanPham(ACTIONS.UPDATE))) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    const validated = sanPhamSchema.parse(data);

    // Lấy thông tin loại SP hiện tại để lấy % lợi nhuận (Loại và DVT không đổi)
    const currentSP = await prisma.sanPham.findUnique({ 
      where: { maSP },
      include: { loaiSanPham: true, donViTinh: true }
    });
    if (!currentSP) return { success: false, message: "Sản phẩm không tồn tại" };
    if (validated.maDVT !== currentSP.maDVT || validated.maLSP !== currentSP.maLSP) {
      return { success: false, message: "Không được thay đổi loại sản phẩm hoặc đơn vị tính khi cập nhật sản phẩm" };
    }
    if (currentSP.maDVT !== currentSP.loaiSanPham.maDVT) {
      return { success: false, message: "Đơn vị tính sản phẩm không khớp với loại sản phẩm" };
    }

    // Bước 4: Tự động tính lại giá bán nếu giá nhập đổi
    const giaBan = calculateSellPrice(Number(validated.donGiaNhap), Number(currentSP.loaiSanPham.phanTramLoiNhuan));

    const record = await prisma.sanPham.update({
      where: { maSP },
      data: {
        tenSP: validated.tenSP,
        hamLuong: validated.hamLuong as any,
        trongLuong: validated.trongLuong,
        tonToiThieu: validated.tonToiThieu,
        donGiaNhap: validated.donGiaNhap,
        donGiaBan: giaBan,
      },
    });

    revalidatePath("/admin/danh-muc/san-pham");
    return { success: true, message: "Cập nhật sản phẩm thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi khi cập nhật sản phẩm" };
  }
}

// 5. Xóa Sản phẩm
export async function deleteSanPham(maSP: string) {
  try {
    if (!(await canManageSanPham(ACTIONS.DELETE))) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    await prisma.sanPham.update({
      where: { maSP },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/danh-muc/san-pham");
    revalidatePath("/nhan-vien/danh-muc/san-pham");
    return { success: true, message: "Xóa sản phẩm thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi hệ thống khi xóa sản phẩm" };
  }
}
