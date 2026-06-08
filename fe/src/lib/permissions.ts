import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── Mã hành động ──────────────────────────────────────────────
export const ACTIONS = {
  VIEW: "XEM",
  CREATE: "THEM",
  UPDATE: "SUA",
  DELETE: "XOA",
} as const;

export type ActionCode = (typeof ACTIONS)[keyof typeof ACTIONS];

// ── Mã chức năng ──────────────────────────────────────────────
export const PERMISSIONS = {
  DON_VI_TINH: "DM_DVT",
  LOAI_SAN_PHAM: "DM_LSP",
  SAN_PHAM: "DM_SP",
  KHACH_HANG: "DM_KH",
  NHA_CUNG_CAP: "DM_NCC",
  BAN_HANG: "GD_BAN",
  MUA_HANG: "GD_MUA",
  LAP_DICH_VU: "DV_LAP",
  LOAI_DICH_VU: "DV_LDV",
  TRA_CUU_DICH_VU: "DV_TRA",
  BAO_CAO_TON_KHO: "BC_TON",
  BAO_CAO_DOANH_THU: "BC_DTH",
  USER_MGMT: "HT_USR",
  PHAN_QUYEN: "HT_PHQ",
  QUY_DINH: "HT_QDI",
  BACKUP_RESTORE: "HT_BAK",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const MANAGER_GROUP_CODE = "QUANLY";
export const STAFF_GROUP_CODE = "NHANVI";
export const SYSTEM_GROUP_CODES = [MANAGER_GROUP_CODE, STAFF_GROUP_CODE] as const;
export const CORE_PERMISSION_CODES = Object.values(PERMISSIONS);

const MANAGER_ONLY_ACTIONS: Partial<Record<PermissionCode, readonly string[]>> = {
  [PERMISSIONS.DON_VI_TINH]: [ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  [PERMISSIONS.LOAI_SAN_PHAM]: [ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  [PERMISSIONS.NHA_CUNG_CAP]: [ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  [PERMISSIONS.USER_MGMT]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  [PERMISSIONS.PHAN_QUYEN]: [ACTIONS.VIEW, ACTIONS.UPDATE],
  [PERMISSIONS.QUY_DINH]: [ACTIONS.VIEW, ACTIONS.UPDATE],
  [PERMISSIONS.BACKUP_RESTORE]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE],
};

export function isManagerOnlyAction(maChucNang: string, hanhDong: string) {
  return MANAGER_ONLY_ACTIONS[maChucNang as PermissionCode]?.includes(hanhDong) ?? false;
}

type PermissionSession = {
  user?: {
    role: string;
    maNhom: string;
    permissions?: string[]; // backward compat
  } | null;
} | null;

/**
 * Kiểm tra quyền theo chức năng + hành động.
 * @param maChucNang - Mã chức năng (VD: "DM_SP")
 * @param hanhDong - Mã hành động (VD: "XEM", "THEM", "SUA", "XOA")
 * @param session - Session hiện tại (optional, tự lấy nếu không truyền)
 */
export async function hasPermission(
  maChucNang: string,
  hanhDong: string = ACTIONS.VIEW,
  existingSession?: PermissionSession
): Promise<boolean> {
  const session = existingSession ?? (await getServerSession(authOptions) as PermissionSession);
  if (!session?.user?.maNhom) return false;

  // Mã nhóm hệ thống là định danh ổn định; tên nhóm chỉ dùng để hiển thị.
  if (session.user.maNhom === MANAGER_GROUP_CODE) return true;
  if (isManagerOnlyAction(maChucNang, hanhDong)) return false;

  // Kiểm tra DB trực tiếp (real-time)
  // CHAR(4) padding: DB lưu "XEM " (4 chars) nên cần pad input
  const paddedHanhDong = hanhDong.padEnd(4);
  const record = await prisma.bangPhanQuyen.findUnique({
    where: {
      maNhom_maChucNang_hanhDong: {
        maNhom: session.user.maNhom,
        maChucNang: maChucNang,
        hanhDong: paddedHanhDong,
      },
    },
  });

  if (record) return true;

  // Fallback: nếu chưa có bản ghi phân quyền nào → dùng default
  const permissionCount = await prisma.bangPhanQuyen.count({
    where: { maNhom: session.user.maNhom },
  });

  if (permissionCount === 0) {
    return false;
  }

  return false;
}

/**
 * Kiểm tra có quyền XEM (dùng cho sidebar/middleware).
 */
export async function hasViewPermission(
  maChucNang: string,
  existingSession?: PermissionSession
): Promise<boolean> {
  return hasPermission(maChucNang, ACTIONS.VIEW, existingSession);
}

/**
 * Lấy tất cả quyền hiện tại từ DB (real-time).
 * Trả về mảng chuỗi "maChucNang:hanhDong" (VD: "DM_SP:XEM").
 */
export async function getCurrentPermissions(): Promise<string[]> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { maNhom?: string; role?: string } | undefined;
  if (!user?.maNhom) return [];

  // Quản lý → trả về tất cả
  if (user.maNhom === MANAGER_GROUP_CODE) {
    return ALL_PERMISSIONS;
  }

  const records = await prisma.bangPhanQuyen.findMany({
    where: { maNhom: user.maNhom },
    select: { maChucNang: true, hanhDong: true },
  });

  if (records.length > 0) {
    return records
      .filter((r) => !isManagerOnlyAction(r.maChucNang.trim(), r.hanhDong.trim()))
      .map((r) => `${r.maChucNang.trim()}:${r.hanhDong.trim()}`);
  }

  return [];
}

// ── Default permissions ──────────────────────────────────────
const ALL_PERMISSIONS: string[] = [];
const ALL_ACTIONS_MAP: Record<string, string[]> = {
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

// Build ALL_PERMISSIONS at module load
for (const [code, actions] of Object.entries(ALL_ACTIONS_MAP)) {
  for (const action of actions) {
    ALL_PERMISSIONS.push(`${code}:${action}`);
  }
}
