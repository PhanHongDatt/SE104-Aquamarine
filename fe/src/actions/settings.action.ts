"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";
import { systemSettingsSchema } from "@/schemas/system-settings.schema";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getSystemSettings() {
  const session = await getServerSession(authOptions) as any;
  if (!(await hasPermission(PERMISSIONS.QUY_DINH, ACTIONS.VIEW, session))) {
    return null;
  }
  const settings = await prisma.thamSo.findFirst({
    where: { id: 1 }
  });
  return serialize(settings);
}

export async function updateSystemSettings(data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    
    if (!(await hasPermission(PERMISSIONS.QUY_DINH, ACTIONS.UPDATE, session))) {
      return {
        success: false,
        message: "Bạn không có quyền thay đổi quy định."
      };
    }
    const validated = systemSettingsSchema.parse(data);

    // Step 2 & 3: Update ThamSo in DB
    const result = await prisma.$transaction(async (tx) => {
      const oldSettings = await tx.thamSo.findUnique({ where: { id: 1 } });
      const updated = await tx.thamSo.update({
        where: { id: 1 },
        data: {
          phanTramLoiNhuanToiThieu: validated.phanTramLoiNhuanToiThieu,
          soLuongTonKhoToiThieu: validated.soLuongTonKhoToiThieu,
          tiLeTraTruocToiThieu: validated.tiLeTraTruocToiThieu,
        }
      });

      await tx.lichSuThayDoiQuyDinh.create({
        data: {
          maND: session?.user?.id ?? null,
          giaTriCu: serialize(oldSettings ?? {}),
          giaTriMoi: serialize(updated),
        },
      });

      return updated;
    });

    return {
      success: true,
      message: "Cập nhật các quy định hệ thống thành công",
      data: serialize(result)
    };
  } catch (error: any) {
    console.error("[updateSystemSettings] Error:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi cập nhật tham số"
    };
  }
}
