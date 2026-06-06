"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function requireManager() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "QUAN_LY") {
    throw new Error("Bạn không có quyền phân quyền người dùng");
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
  const result = data.map((item) => `${item.maChucNang.trim()}:${item.hanhDong.trim()}`);
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

    const uniquePermissions = Array.from(new Set(permissions));

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
