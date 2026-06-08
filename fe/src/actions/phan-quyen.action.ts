"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { groupSchema, groupUpdateSchema, chucNangSchema, chucNangUpdateSchema } from "@/schemas/permission.schema";
import { CORE_PERMISSION_CODES, MANAGER_GROUP_CODE, SYSTEM_GROUP_CODES, isManagerOnlyAction } from "@/lib/permissions";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function requireManager() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.maNhom !== MANAGER_GROUP_CODE) {
    throw new Error("Bạn không có quyền phân quyền người dùng");
  }
}

// ── Nhóm người dùng CRUD ─────────────────────────────────────

export async function createNhomNguoiDung(data: { maNhom: string; tenNhom: string }) {
  try {
    await requireManager();
    const validated = groupSchema.parse(data);
    const maNhom = validated.maNhom.toUpperCase();

    const duplicatedGroup = await prisma.nhomNguoiDung.findFirst({
      where: {
        OR: [
          { maNhom },
          { tenNhom: { equals: validated.tenNhom, mode: "insensitive" } },
        ],
      },
    });
    if (duplicatedGroup) {
      return { success: false, message: "Mã nhóm hoặc tên nhóm đã tồn tại" };
    }

    await prisma.nhomNguoiDung.create({
      data: { maNhom, tenNhom: validated.tenNhom },
    });

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Tạo nhóm người dùng thành công" };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Mã nhóm hoặc tên nhóm đã tồn tại" };
    }
    return { success: false, message: error.message || "Lỗi khi tạo nhóm người dùng" };
  }
}

export async function updateNhomNguoiDung(maNhom: string, data: { tenNhom: string }) {
  try {
    await requireManager();
    if (SYSTEM_GROUP_CODES.includes(maNhom as any)) {
      return { success: false, message: "Không thể đổi tên nhóm hệ thống" };
    }
    const validated = groupUpdateSchema.parse(data);
    const duplicatedGroup = await prisma.nhomNguoiDung.findFirst({
      where: {
        tenNhom: { equals: validated.tenNhom, mode: "insensitive" },
        NOT: { maNhom },
      },
    });
    if (duplicatedGroup) {
      return { success: false, message: "Tên nhóm đã tồn tại" };
    }

    await prisma.nhomNguoiDung.update({
      where: { maNhom },
      data: { tenNhom: validated.tenNhom },
    });

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Cập nhật nhóm người dùng thành công" };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Tên nhóm đã tồn tại" };
    }
    return { success: false, message: error.message || "Lỗi khi cập nhật nhóm người dùng" };
  }
}

export async function deleteNhomNguoiDung(maNhom: string) {
  try {
    await requireManager();

    // Không cho xóa nhóm hệ thống
    if (SYSTEM_GROUP_CODES.includes(maNhom as any)) {
      return { success: false, message: "Không thể xóa nhóm hệ thống" };
    }

    // Kiểm tra có người dùng trong nhóm không
    const userCount = await prisma.nguoiDung.count({ where: { maNhom } });
    if (userCount > 0) {
      return { success: false, message: "Không thể xóa nhóm đang có người dùng. Vui lòng chuyển người dùng sang nhóm khác trước." };
    }

    // Transaction: xóa bangPhanQuyen trước, rồi xóa nhóm
    await prisma.$transaction(async (tx) => {
      await tx.bangPhanQuyen.deleteMany({ where: { maNhom } });
      await tx.nhomNguoiDung.delete({ where: { maNhom } });
    });

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Xóa nhóm người dùng thành công" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi khi xóa nhóm người dùng" };
  }
}

// ── Chức năng CRUD ────────────────────────────────────────────

export async function createChucNang(data: { maChucNang: string; tenChucNang: string; tenManHinhDuocLoad: string }) {
  try {
    await requireManager();
    const validated = chucNangSchema.parse(data);
    const duplicatedFunction = await prisma.chucNang.findFirst({
      where: {
        OR: [
          { maChucNang: validated.maChucNang.toUpperCase() },
          { tenChucNang: { equals: validated.tenChucNang, mode: "insensitive" } },
        ],
      },
    });
    if (duplicatedFunction) {
      return { success: false, message: "Mã chức năng hoặc tên chức năng đã tồn tại" };
    }
    return {
      success: false,
      message: "Không thể tạo chức năng chỉ bằng cấu hình. Chức năng mới phải được triển khai kèm màn hình và kiểm tra quyền trong mã nguồn.",
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Mã chức năng hoặc tên chức năng đã tồn tại" };
    }
    return { success: false, message: error.message || "Lỗi khi tạo chức năng" };
  }
}

export async function updateChucNang(maChucNang: string, data: { tenChucNang: string; tenManHinhDuocLoad: string }) {
  try {
    await requireManager();
    if (CORE_PERMISSION_CODES.includes(maChucNang as any)) {
      return { success: false, message: "Không thể sửa chức năng hệ thống" };
    }
    const validated = chucNangUpdateSchema.parse(data);
    const duplicatedFunction = await prisma.chucNang.findFirst({
      where: {
        tenChucNang: { equals: validated.tenChucNang, mode: "insensitive" },
        NOT: { maChucNang },
      },
    });
    if (duplicatedFunction) {
      return { success: false, message: "Tên chức năng đã tồn tại" };
    }

    await prisma.chucNang.update({
      where: { maChucNang },
      data: { tenChucNang: validated.tenChucNang, tenManHinhDuocLoad: validated.tenManHinhDuocLoad },
    });

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Cập nhật chức năng thành công" };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Tên chức năng đã tồn tại" };
    }
    return { success: false, message: error.message || "Lỗi khi cập nhật chức năng" };
  }
}

export async function deleteChucNang(maChucNang: string) {
  try {
    await requireManager();
    if (CORE_PERMISSION_CODES.includes(maChucNang as any)) {
      return { success: false, message: "Không thể xóa chức năng hệ thống" };
    }

    // Transaction: xóa bangPhanQuyen liên quan trước
    await prisma.$transaction(async (tx) => {
      await tx.bangPhanQuyen.deleteMany({ where: { maChucNang } });
      await tx.chucNang.delete({ where: { maChucNang } });
    });

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Xóa chức năng thành công" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi khi xóa chức năng" };
  }
}

export async function getChucNangs() {
  await requireManager();
  const data = await prisma.chucNang.findMany({
    orderBy: { maChucNang: "asc" },
  });
  // Trim Char(6) padding từ DB
  return serialize(data).map((item: any) => ({
    ...item,
    maChucNang: item.maChucNang.trim(),
  }));
}

/**
 * Lấy quyền hiện tại của một nhóm.
 * Trả về mảng chuỗi "maChucNang:hanhDong" (VD: "DM_SP:XEM").
 */
export async function getBangPhanQuyen(maNhom: string) {
  await requireManager();
  const data = await prisma.bangPhanQuyen.findMany({
    where: { maNhom },
    select: { maChucNang: true, hanhDong: true },
    orderBy: [{ maChucNang: "asc" }, { hanhDong: "asc" }],
  });
  const result = data
    .filter((item) => maNhom === MANAGER_GROUP_CODE || !isManagerOnlyAction(item.maChucNang.trim(), item.hanhDong.trim()))
    .map((item) => `${item.maChucNang.trim()}:${item.hanhDong.trim()}`);
  console.log(`[getBangPhanQuyen] maNhom=${maNhom}, count=${result.length}`);
  return result;
}

/**
 * Lưu quyền cho một nhóm.
 * @param maNhom - Mã nhóm (VD: "QUANLY", "NHANVI")
 * @param permissions - Mảng chuỗi "maChucNang:hanhDong" (VD: ["DM_SP:XEM", "DM_SP:THEM"])
 */
export async function setBangPhanQuyen(maNhom: string, permissions: string[]) {
  try {
    await requireManager();

    if (maNhom === MANAGER_GROUP_CODE) {
      return { success: false, message: "Nhóm Quản lý luôn có toàn quyền và không thể thay đổi" };
    }

    const uniquePermissions = Array.from(new Set(permissions)).filter((perm) => {
      const [maChucNang, hanhDong] = perm.split(":").map((part) => part.trim());
      return maChucNang && hanhDong && !isManagerOnlyAction(maChucNang, hanhDong);
    });

    console.log(`[setBangPhanQuyen] maNhom=${maNhom}, input=${permissions.length}, unique=${uniquePermissions.length}`);

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.bangPhanQuyen.deleteMany({ where: { maNhom } });
      console.log(`[setBangPhanQuyen] deleted ${deleted.count} old records`);

      if (uniquePermissions.length > 0) {
        // Trim cả maChucNang và hanhDong để tránh Char padding issues
        const records = uniquePermissions.map((perm) => {
          const [maChucNang, hanhDong] = perm.split(":");
          return { maNhom, maChucNang: maChucNang.trim(), hanhDong: hanhDong.trim() };
        });
        console.log(`[setBangPhanQuyen] inserting ${records.length} records`);
        await tx.bangPhanQuyen.createMany({
          data: records,
          skipDuplicates: true,
        });
      }
    });

    // Verify sau khi lưu
    const verify = await prisma.bangPhanQuyen.findMany({ where: { maNhom } });
    console.log(`[setBangPhanQuyen] verify: DB now has ${verify.length} records for ${maNhom}`);

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Cập nhật phân quyền thành công" };
  } catch (error: any) {
    console.error(`[setBangPhanQuyen] ERROR:`, error);
    return { success: false, message: error.message || "Lỗi khi cập nhật phân quyền" };
  }
}
