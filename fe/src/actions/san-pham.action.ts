"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanPhamSchema, sanPhamUpdateSchema, type SanPhamInput } from "@/schemas/san-pham.schema";
import {
  assertDvtValidForLoaiSP,
  assertHamLuongValidForLoaiSP,
  calculateSellPrice,
  getDefaultHamLuongForLoaiSP,
  getAllowedHamLuongValuesForLoaiSP,
  normalizeComparableText,
} from "@/lib/business-rules";
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

async function findDuplicateProductName(maLSP: string, tenSP: string, excludeMaSP?: string) {
  const normalizedName = normalizeComparableText(tenSP);
  const candidates = await prisma.sanPham.findMany({
    where: {
      maLSP,
      deletedAt: null,
      ...(excludeMaSP ? { NOT: { maSP: excludeMaSP } } : {}),
    },
    select: { maSP: true, tenSP: true },
  });

  return candidates.find((product) => normalizeComparableText(product.tenSP) === normalizedName) ?? null;
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
    const [category, donViTinh] = await Promise.all([
      prisma.loaiSanPham.findUnique({ where: { maLSP: validated.maLSP } }),
      prisma.donViTinh.findUnique({ where: { maDVT: validated.maDVT } }),
    ]);
    if (!category) return { success: false, message: "Loại sản phẩm không hợp lệ" };
    if (!donViTinh) return { success: false, message: "Đơn vị tính không hợp lệ" };
    assertDvtValidForLoaiSP(category.tenLSP, donViTinh.tenDVT);
    assertHamLuongValidForLoaiSP(category.tenLSP, validated.hamLuong);
    if (validated.maDVT !== category.maDVT) {
      return { success: false, message: "Sản phẩm phải dùng đơn vị tính mặc định của loại sản phẩm" };
    }

    const duplicate = await findDuplicateProductName(validated.maLSP, validated.tenSP);
    if (duplicate) {
      return { success: false, message: `Sản phẩm cùng loại đã tồn tại: ${duplicate.maSP} - ${duplicate.tenSP}` };
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

    const validated = sanPhamUpdateSchema.parse(data);

    const currentSP = await prisma.sanPham.findUnique({ 
      where: { maSP },
      include: { loaiSanPham: true, donViTinh: true }
    });
    if (!currentSP) return { success: false, message: "Sản phẩm không tồn tại" };
    if (currentSP.deletedAt) return { success: false, message: "Sản phẩm đã ngừng kinh doanh" };

    const targetCategory = await prisma.loaiSanPham.findUnique({
      where: { maLSP: validated.maLSP },
      include: { donViTinh: true },
    });
    if (!targetCategory) return { success: false, message: "Loại sản phẩm không hợp lệ" };
    assertDvtValidForLoaiSP(targetCategory.tenLSP, targetCategory.donViTinh.tenDVT);

    const duplicate = await findDuplicateProductName(validated.maLSP, validated.tenSP, maSP);
    if (duplicate) {
      return { success: false, message: `Sản phẩm cùng loại đã tồn tại: ${duplicate.maSP} - ${duplicate.tenSP}` };
    }

    const allowedHamLuong = getAllowedHamLuongValuesForLoaiSP(targetCategory.tenLSP);
    const nextHamLuong = !allowedHamLuong || allowedHamLuong.includes(currentSP.hamLuong)
      ? currentSP.hamLuong
      : getDefaultHamLuongForLoaiSP(targetCategory.tenLSP);

    assertHamLuongValidForLoaiSP(targetCategory.tenLSP, nextHamLuong);

    // Khi sửa sản phẩm chỉ nhận tên và loại. Các trường giá nhập/trọng lượng giữ nguyên.
    const giaBan = calculateSellPrice(Number(currentSP.donGiaNhap), Number(targetCategory.phanTramLoiNhuan));

    const record = await prisma.sanPham.update({
      where: { maSP },
      data: {
        tenSP: validated.tenSP,
        maLSP: targetCategory.maLSP,
        maDVT: targetCategory.maDVT,
        hamLuong: nextHamLuong as any,
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
