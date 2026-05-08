import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    permissions?: string[];
  } | null;
} | null;

const DEFAULT_MANAGER_PERMISSIONS = Object.values(PERMISSIONS);
const DEFAULT_STAFF_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.SAN_PHAM,
  PERMISSIONS.KHACH_HANG,
  PERMISSIONS.BAN_HANG,
  PERMISSIONS.LAP_DICH_VU,
  PERMISSIONS.TRA_CUU_DICH_VU,
  PERMISSIONS.BAO_CAO_TON_KHO,
];

function getDefaultPermissionsByRole(role: "QUAN_LY" | "NHAN_VIEN") {
  return role === "QUAN_LY" ? DEFAULT_MANAGER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS;
}

export async function hasPermission(permission: PermissionCode, existingSession?: PermissionSession) {
  const session = existingSession ?? (await getServerSession(authOptions) as PermissionSession);
  if (!session?.user?.maNhom) return false;

  if (session.user.permissions?.includes(permission)) return true;

  const permissionRecord = await prisma.bangPhanQuyen.findUnique({
    where: {
      maNhom_maChucNang: {
        maNhom: session.user.maNhom,
        maChucNang: permission,
      },
    },
  });

  if (permissionRecord) return true;

  const permissionCount = await prisma.bangPhanQuyen.count({
    where: { maNhom: session.user.maNhom },
  });

  if (permissionCount === 0) {
    return getDefaultPermissionsByRole(session.user.role).includes(permission);
  }

  return false;
}
