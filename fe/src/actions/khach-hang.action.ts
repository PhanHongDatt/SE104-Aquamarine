"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { khachHangSchema, type KhachHangInput } from "@/schemas/khach-hang.schema";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";
import { nextSequentialId, withUniqueRetry } from "@/lib/id-generation";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function requireCustomerPermission(hanhDong: string = ACTIONS.VIEW) {
  const session = await getServerSession(authOptions);
  if (!(await hasPermission(PERMISSIONS.KHACH_HANG, hanhDong, session))) {
    return { allowed: false, message: "Bạn không có quyền quản lý khách hàng" };
  }
  return { allowed: true, message: "" };
}

function normalizeCustomerInput(input: KhachHangInput) {
  return {
    hoTen: input.hoTen.trim(),
    soDienThoai: input.soDienThoai.trim(),
    email: input.email?.trim() || null,
    diaChi: input.diaChi?.trim() || null,
    ngaySinh: input.ngaySinh ? new Date(input.ngaySinh) : null,
    hangThanhVien: input.hangThanhVien,
    ghiChu: input.ghiChu?.trim() || null,
  };
}

async function generateCustomerId() {
  const lastRecord = await prisma.khachHang.findFirst({ orderBy: { maKH: "desc" } });
  return nextSequentialId(lastRecord?.maKH, "KH", 4);
}

export async function getKhachHangs(query?: string) {
  try {
    const auth = await requireCustomerPermission(ACTIONS.VIEW);
    if (!auth.allowed) return { success: false, message: auth.message, data: [] };
    const keyword = query?.trim();
    const data = await prisma.khachHang.findMany({
      where: keyword
        ? {
            deletedAt: null,
            OR: [
              { maKH: { contains: keyword, mode: "insensitive" } },
              { hoTen: { contains: keyword, mode: "insensitive" } },
              { soDienThoai: { contains: keyword, mode: "insensitive" } },
              { email: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : { deletedAt: null },
      orderBy: { maKH: "asc" },
    });

    return { success: true, data: serialize(data) };
  } catch {
    return { success: false, message: "Không thể lấy danh sách khách hàng", data: [] };
  }
}

export async function createKhachHang(input: KhachHangInput) {
  try {
    const auth = await requireCustomerPermission(ACTIONS.CREATE);
    if (!auth.allowed) return { success: false, message: auth.message };

    const validated = khachHangSchema.parse(input);
    const record = await withUniqueRetry(async () => {
      const maKH = await generateCustomerId();
      return prisma.khachHang.create({
        data: {
          maKH,
          ...normalizeCustomerInput(validated),
        },
      });
    });
    const maKH = record.maKH;

    revalidatePath("/admin/danh-muc/khach-hang");
    revalidatePath("/nhan-vien/danh-muc/khach-hang");
    return { success: true, message: `Thêm khách hàng thành công với mã ${maKH}`, data: serialize(record) };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, message: "Số điện thoại khách hàng đã tồn tại" };
    }
    return { success: false, message: error?.errors?.[0]?.message || error?.message || "Lỗi khi thêm khách hàng" };
  }
}

export async function updateKhachHang(maKH: string, input: KhachHangInput) {
  try {
    const auth = await requireCustomerPermission(ACTIONS.UPDATE);
    if (!auth.allowed) return { success: false, message: auth.message };

    const validated = khachHangSchema.parse(input);
    const record = await prisma.khachHang.update({
      where: { maKH },
      data: normalizeCustomerInput(validated),
    });

    revalidatePath("/admin/danh-muc/khach-hang");
    revalidatePath("/nhan-vien/danh-muc/khach-hang");
    return { success: true, message: "Cập nhật khách hàng thành công", data: serialize(record) };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, message: "Số điện thoại khách hàng đã tồn tại" };
    }
    return { success: false, message: error?.errors?.[0]?.message || error?.message || "Lỗi khi cập nhật khách hàng" };
  }
}

export async function deleteKhachHang(maKH: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await hasPermission(PERMISSIONS.KHACH_HANG, ACTIONS.DELETE, session))) {
      return { success: false, message: "Bạn không có quyền xóa khách hàng" };
    }

    await prisma.khachHang.update({
      where: { maKH },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/danh-muc/khach-hang");
    revalidatePath("/nhan-vien/danh-muc/khach-hang");
    return { success: true, message: "Xóa khách hàng thành công" };
  } catch {
    return { success: false, message: "Không thể xóa khách hàng này" };
  }
}
