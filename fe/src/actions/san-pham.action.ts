"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanPhamSchema, type SanPhamInput } from "@/schemas/san-pham.schema";

// 1. Kiểm tra quyền Quản lý
async function checkIsAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "QUAN_LY";
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// 2. Lấy danh sách sản phẩm
export async function getSanPhams() {
  try {
    const data = await prisma.sanPham.findMany({
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
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    // Bước 2: Validate dữ liệu (Zod)
    const validated = sanPhamSchema.parse(data);

    // Bước 3: Lấy thông tin loại sản phẩm để lấy % lợi nhuận
    const category = await prisma.loaiSanPham.findUnique({
      where: { maLSP: validated.maLSP },
    });
    if (!category) return { success: false, message: "Loại sản phẩm không hợp lệ" };

    // Bước 7: Tự động tính đơn giá bán
    // Đơn giá bán = Đơn giá nhập × (1 + % Lợi nhuận / 100)
    const giaBan = Number(validated.donGiaNhap) * (1 + Number(category.phanTramLoiNhuan) / 100);

    // Bước 8: Tự động sinh mã sản phẩm SPxxx
    const lastRecord = await prisma.sanPham.findFirst({
      orderBy: { maSP: "desc" },
    });
    let newId = "SP001";
    if (lastRecord) {
      const lastIdNum = parseInt(lastRecord.maSP.replace("SP", ""));
      newId = `SP${(lastIdNum + 1).toString().padStart(3, "0")}`;
    }

    // Bước 9: Gán tồn tối thiểu từ tham số hệ thống (mặc định nếu không nhập)
    const thamSo = await prisma.thamSo.findFirst({ where: { id: 1 } });
    const tonToiThieuMacDinh = thamSo ? thamSo.soLuongTonKhoToiThieu : 1;

    // Bước 10: Lưu bản ghi
    const record = await prisma.sanPham.create({
      data: {
        maSP: newId,
        tenSP: validated.tenSP,
        maLSP: validated.maLSP,
        hamLuong: validated.hamLuong as any,
        trongLuong: validated.trongLuong,
        maDVT: validated.maDVT,
        tonToiThieu: validated.tonToiThieu || tonToiThieuMacDinh,
        tonKho: 0, // Mặc định khi tạo mới là 0, sẽ nhập qua phiếu mua sau
        donGiaNhap: validated.donGiaNhap,
        donGiaBan: giaBan,
      },
    });

    revalidatePath("/admin/danh-muc/san-pham");
    return { success: true, message: `Thêm sản phẩm thành công với mã ${newId}`, data: serialize(record) };
  } catch (error: any) {
    console.error("Create SP Error:", error);
    return { success: false, message: error.message || "Lỗi hệ thống khi tạo sản phẩm" };
  }
}

// 4. Sửa Sản phẩm (Thuật toán 2.2.3.5)
export async function updateSanPham(maSP: string, data: SanPhamInput) {
  try {
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    const validated = sanPhamSchema.parse(data);

    // Lấy thông tin loại SP hiện tại để lấy % lợi nhuận (Loại và DVT không đổi)
    const currentSP = await prisma.sanPham.findUnique({ 
      where: { maSP },
      include: { loaiSanPham: true }
    });
    if (!currentSP) return { success: false, message: "Sản phẩm không tồn tại" };

    // Bước 4: Tự động tính lại giá bán nếu giá nhập đổi
    const giaBan = Number(validated.donGiaNhap) * (1 + Number(currentSP.loaiSanPham.phanTramLoiNhuan) / 100);

    const record = await prisma.sanPham.update({
      where: { maSP },
      data: {
        tenSP: validated.tenSP,
        hamLuong: validated.hamLuong as any,
        trongLuong: validated.trongLuong,
        donGiaNhap: validated.donGiaNhap,
        donGiaBan: giaBan,
        tonToiThieu: validated.tonToiThieu,
      },
    });

    revalidatePath("/admin/danh-muc/san-pham");
    return { success: true, message: "Cập nhật sản phẩm thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi cập nhật sản phẩm" };
  }
}

// 5. Xóa Sản phẩm
export async function deleteSanPham(maSP: string) {
  try {
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện chức năng này" };
    }

    // Kiểm tra ràng buộc: Không xóa nếu đã có giao dịch
    const isSold = await prisma.chiTietBanHang.findFirst({ where: { maSP } });
    const isBought = await prisma.chiTietMuaHang.findFirst({ where: { maSP } });

    if (isSold || isBought) {
      return { 
        success: false, 
        message: "Không thể xóa sản phẩm đã có lịch sử giao dịch (bán hoặc mua). Vui lòng kiểm tra lại." 
      };
    }

    await prisma.sanPham.delete({ where: { maSP } });

    revalidatePath("/admin/danh-muc/san-pham");
    return { success: true, message: "Xóa sản phẩm thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi hệ thống khi xóa sản phẩm" };
  }
}
