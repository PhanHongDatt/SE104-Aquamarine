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
  const settings = await prisma.thamSo.findFirst({
    where: { id: 1 }
  });
  return serialize(settings);
}

export async function updateSystemSettings(data: any) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await hasPermission(PERMISSIONS.QUY_DINH, ACTIONS.UPDATE, session))) {
      return {
        success: false,
        message: "Bạn không có quyền thay đổi quy định."
      };
    }
    const validated = systemSettingsSchema.parse(data);

    // Step 2 & 3: Update ThamSo in DB
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.thamSo.update({
        where: { id: 1 },
        data: {
          phanTramLoiNhuanToiThieu: validated.phanTramLoiNhuanToiThieu,
          soLuongTonKhoToiThieu: validated.soLuongTonKhoToiThieu,
          soLuongNhapToiThieu: validated.soLuongNhapToiThieu,
          tiLeTraTruocToiThieu: validated.tiLeTraTruocToiThieu,
        }
      });

      // QĐ2: Cập nhật lại đơn giá bán của các LOẠI sản phẩm dựa trên tỷ lệ mới (nếu cần)
      // Theo schema, donGiaBan nằm ở LoaiSanPham
      // Tuy nhiên, việc tự động tính lại đơn giá bán cần biết giá mua. 
      // Nếu dự án có cơ chế giá bán = giá mua * (1 + tỷ lệ lợi nhuận), ta sẽ thực hiện ở đây.
      // Vì schema hiện tại không lưu 'giaMua' cố định trên LoaiSanPham (thường lấy từ giá mua gần nhất),
      // nên ta sẽ đảm bảo các logic lập phiếu bán hàng sau này sẽ lấy tỷ lệ mới từ ThamSo.

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
