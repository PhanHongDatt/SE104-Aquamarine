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
  TRA_CUU_DICH_VU: "DV_TRA",
  BAO_CAO_TON_KHO: "BC_TON",
  BAO_CAO_DOANH_THU: "BC_DTH",
  USER_MGMT: "HT_USR",
  PHAN_QUYEN: "HT_PHQ",
  QUY_DINH: "HT_QDI",
  BACKUP_RESTORE: "HT_BAK",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

type PermissionSession = {
  user?: {
    role: "QUAN_LY" | "NHAN_VIEN";
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

  // Quản lý luôn có tất cả quyền
  if (session.user.role === "QUAN_LY") return true;

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
    const defaultPerms = getDefaultPermissionsByRole(session.user.role);
    return defaultPerms.some(
      (p) => p.maChucNang === maChucNang && p.hanhDong.trim() === hanhDong
    );
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
  if (!session?.user?.maNhom) return [];

  // Quản lý → trả về tất cả
  if ((session.user as any)?.role === "QUAN_LY") {
    return ALL_PERMISSIONS;
  }

  const records = await prisma.bangPhanQuyen.findMany({
    where: { maNhom: session.user.maNhom },
    select: { maChucNang: true, hanhDong: true },
  });

  if (records.length > 0) {
    return records.map((r) => `${r.maChucNang.trim()}:${r.hanhDong.trim()}`);
  }

  // Fallback defaults
  return getDefaultPermissionsByRole((session.user as any)?.role).map(
    (p) => `${p.maChucNang}:${p.hanhDong}`
  );
}

// ── Default permissions ──────────────────────────────────────
type PermEntry = { maChucNang: string; hanhDong: string };

const ALL_PERMISSIONS: string[] = [];
const ALL_ACTIONS_MAP: Record<string, string[]> = {
  DM_DVT: ["XEM", "THEM", "SUA", "XOA"],
  DM_LSP: ["XEM", "THEM", "SUA", "XOA"],
  DM_SP:  ["XEM", "THEM", "SUA", "XOA"],
  DM_KH:  ["XEM", "THEM", "SUA", "XOA"],
  DM_NCC: ["XEM", "THEM", "SUA", "XOA"],
  GD_BAN: ["XEM", "THEM"],
  GD_MUA: ["XEM", "THEM"],
  DV_LAP: ["XEM", "THEM"],
  DV_TRA: ["XEM", "SUA"],
  BC_TON: ["XEM"],
  BC_DTH: ["XEM"],
  HT_USR: ["XEM", "THEM", "SUA", "XOA"],
  HT_PHQ: ["XEM", "SUA"],
  HT_QDI: ["XEM", "SUA"],
  HT_BAK: ["XEM", "THEM"],
};

// Build ALL_PERMISSIONS at module load
for (const [code, actions] of Object.entries(ALL_ACTIONS_MAP)) {
  for (const action of actions) {
    ALL_PERMISSIONS.push(`${code}:${action}`);
  }
}

const DEFAULT_MANAGER_PERMS: PermEntry[] = Object.entries(ALL_ACTIONS_MAP).flatMap(
  ([code, actions]) => actions.map((a) => ({ maChucNang: code, hanhDong: a }))
);

const DEFAULT_STAFF_PERMS: PermEntry[] = [
  { maChucNang: "DM_SP", hanhDong: "XEM" },
  { maChucNang: "DM_KH", hanhDong: "XEM" },
  { maChucNang: "DM_KH", hanhDong: "THEM" },
  { maChucNang: "DM_KH", hanhDong: "SUA" },
  { maChucNang: "GD_BAN", hanhDong: "XEM" },
  { maChucNang: "GD_BAN", hanhDong: "THEM" },
  { maChucNang: "DV_LAP", hanhDong: "XEM" },
  { maChucNang: "DV_LAP", hanhDong: "THEM" },
  { maChucNang: "DV_TRA", hanhDong: "XEM" },
  { maChucNang: "DV_TRA", hanhDong: "SUA" },
  { maChucNang: "BC_TON", hanhDong: "XEM" },
];

function getDefaultPermissionsByRole(role: string): PermEntry[] {
  return role === "QUAN_LY" ? DEFAULT_MANAGER_PERMS : DEFAULT_STAFF_PERMS;
}
