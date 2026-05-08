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
  return serialize(data);
}

export async function getBangPhanQuyen(maNhom: string) {
  await requireManager();
  const data = await prisma.bangPhanQuyen.findMany({
    where: { maNhom },
    select: { maChucNang: true },
    orderBy: { maChucNang: "asc" },
  });
  return data.map((item) => item.maChucNang);
}

export async function setBangPhanQuyen(maNhom: string, maChucNangs: string[]) {
  try {
    await requireManager();

    const uniquePermissions = Array.from(new Set(maChucNangs));

    await prisma.$transaction(async (tx) => {
      await tx.bangPhanQuyen.deleteMany({ where: { maNhom } });

      if (uniquePermissions.length > 0) {
        await tx.bangPhanQuyen.createMany({
          data: uniquePermissions.map((maChucNang) => ({ maNhom, maChucNang })),
          skipDuplicates: true,
        });
      }
    });

    revalidatePath("/admin/cai-dat/phan-quyen");
    return { success: true, message: "Cập nhật phân quyền thành công" };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi khi cập nhật phân quyền" };
  }
}
