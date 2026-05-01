"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { donViTinhSchema, type DonViTinhInput } from "@/schemas/don-vi-tinh.schema";

async function checkIsAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "QUAN_LY";
}

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getDonViTinhs() {
  try {
    const data = await prisma.donViTinh.findMany({
      orderBy: { maDVT: "asc" },
    });
    return { success: true, data: serialize(data) };
  } catch (error: any) {
    console.error("[Prisma Error] getDonViTinhs:", error);
    return { success: false, message: `Lỗi DB: ${error.message || "Không xác định"}` };
  }
}

export async function createDonViTinh(data: DonViTinhInput) {
  try {
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const validated = donViTinhSchema.parse(data);

    const existing = await prisma.donViTinh.findUnique({
      where: { tenDVT: validated.tenDVT },
    });
    if (existing) {
      return { success: false, message: "Tên đơn vị tính đã tồn tại" };
    }

    const lastRecord = await prisma.donViTinh.findFirst({
      orderBy: { maDVT: "desc" },
    });

    let newId = "DVT001";
    if (lastRecord) {
      const lastIdNum = parseInt(lastRecord.maDVT.replace("DVT", ""));
      newId = `DVT${(lastIdNum + 1).toString().padStart(3, "0")}`;
    }

    const record = await prisma.donViTinh.create({
      data: {
        maDVT: newId,
        tenDVT: validated.tenDVT,
      },
    });

    revalidatePath("/admin/danh-muc/don-vi-tinh");
    return { success: true, message: "Thêm đơn vị tính thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống" };
  }
}

export async function updateDonViTinh(maDVT: string, data: DonViTinhInput) {
  try {
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const validated = donViTinhSchema.parse(data);

    const existing = await prisma.donViTinh.findFirst({
      where: { tenDVT: validated.tenDVT, NOT: { maDVT: maDVT } },
    });
    if (existing) {
      return { success: false, message: "Tên đơn vị tính đã tồn tại" };
    }

    const record = await prisma.donViTinh.update({
      where: { maDVT },
      data: { 
        tenDVT: validated.tenDVT,
      },
    });

    revalidatePath("/admin/danh-muc/don-vi-tinh");
    return { success: true, message: "Cập nhật thành công", data: serialize(record) };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi hệ thống" };
  }
}

export async function deleteDonViTinh(maDVT: string) {
  try {
    if (!(await checkIsAdmin())) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const usedInLSP = await prisma.loaiSanPham.findFirst({ where: { maDVT } });
    const usedInSP = await prisma.sanPham.findFirst({ where: { maDVT } });

    if (usedInLSP || usedInSP) {
      return { 
        success: false, 
        message: "Không thể xóa đơn vị tính này vì đang được sử dụng bởi Sản phẩm hoặc Loại sản phẩm." 
      };
    }

    await prisma.donViTinh.delete({ where: { maDVT } });

    revalidatePath("/admin/danh-muc/don-vi-tinh");
    return { success: true, message: "Xóa đơn vị tính thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi xóa dữ liệu" };
  }
}
