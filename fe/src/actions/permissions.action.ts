"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_GROUP_CODE, isManagerOnlyAction } from "@/lib/permissions";

/**
 * Lấy danh sách quyền hiện tại của người dùng trực tiếp từ DB.
 * Trả về mảng chuỗi "maChucNang:hanhDong" (VD: "DM_SP:XEM").
 */
export async function getMyPermissions(): Promise<{
  success: boolean;
  permissions: string[];
  role: string | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.maNhom) {
      return { success: false, permissions: [], role: null };
    }

    const role = (session.user as any)?.role ?? null;

    // Quản lý → trả về tất cả quyền
    if (session.user.maNhom === MANAGER_GROUP_CODE) {
      const allPerms = await prisma.bangPhanQuyen.findMany({
        where: { maNhom: session.user.maNhom },
        select: { maChucNang: true, hanhDong: true },
      });
      if (allPerms.length > 0) {
        return { success: true, permissions: allPerms.map((r) => `${r.maChucNang.trim()}:${r.hanhDong.trim()}`), role };
      }
      // Fallback: quản lý có tất cả
      return { success: true, permissions: getAllDefaultPermissions(), role };
    }

    // Nhóm khác QUAN_LY → lấy từ DB
    const records = await prisma.bangPhanQuyen.findMany({
      where: { maNhom: session.user.maNhom },
      select: { maChucNang: true, hanhDong: true },
    });

    if (records.length > 0) {
      return {
        success: true,
        permissions: records
          .filter((r) => !isManagerOnlyAction(r.maChucNang.trim(), r.hanhDong.trim()))
          .map((r) => `${r.maChucNang.trim()}:${r.hanhDong.trim()}`),
        role,
      };
    }

    return { success: true, permissions: [], role };
  } catch {
    return { success: false, permissions: [], role: null };
  }
}

function getAllDefaultPermissions(): string[] {
  const map: Record<string, string[]> = {
    DM_DVT: ["XEM", "THEM", "SUA", "XOA"],
    DM_LSP: ["XEM", "THEM", "SUA", "XOA"],
    DM_SP:  ["XEM", "THEM", "SUA", "XOA"],
    DM_KH:  ["XEM", "THEM", "SUA", "XOA"],
    DM_NCC: ["XEM", "THEM", "SUA", "XOA"],
    GD_BAN: ["XEM", "THEM", "SUA", "XOA"],
    GD_MUA: ["XEM", "THEM", "SUA", "XOA"],
    DV_LAP: ["XEM", "THEM"],
    DV_LDV: ["XEM", "THEM", "SUA", "XOA"],
    DV_TRA: ["XEM", "SUA", "XOA"],
    BC_TON: ["XEM"],
    BC_DTH: ["XEM"],
    HT_USR: ["XEM", "THEM", "SUA", "XOA"],
    HT_PHQ: ["XEM", "SUA"],
    HT_QDI: ["XEM", "SUA"],
    HT_BAK: ["XEM", "THEM", "SUA"],
  };
  const result: string[] = [];
  for (const [code, actions] of Object.entries(map)) {
    for (const action of actions) result.push(`${code}:${action}`);
  }
  return result;
}
