"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getDanhSachNguoiDung() {
  const data = await prisma.nguoiDung.findMany({
    include: { nhomNguoiDung: true },
    orderBy: { maND: 'asc' }
  });
  return serialize(data);
}

export async function getDanhSachNhomNguoiDung() {
  const data = await prisma.nhomNguoiDung.findMany({
    orderBy: { maNhom: 'asc' }
  });
  return serialize(data);
}

export async function createNguoiDung(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Generate maND
    const lastUser = await prisma.nguoiDung.findFirst({
      orderBy: { maND: 'desc' }
    });
    
    let nextNum = 1;
    if (lastUser) {
      nextNum = parseInt(lastUser.maND.replace('ND', '')) + 1;
    }
    const maND = `ND${nextNum.toString().padStart(4, '0')}`;

    const result = await prisma.nguoiDung.create({
      data: {
        maND,
        tenDangNhap: data.tenDangNhap,
        matKhau: data.matKhau, // Plain text for dev as per project current state
        hoTen: data.hoTen,
        maNhom: data.maNhom,
      }
    });

    return { success: true, message: "Tạo tài khoản người dùng thành công", data: serialize(result) };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: "Tên đăng nhập đã tồn tại" };
    }
    return { success: false, message: "Lỗi khi tạo người dùng" };
  }
}

export async function updateNguoiDung(maND: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const updateData: any = {
      hoTen: data.hoTen,
      maNhom: data.maNhom,
    };

    if (data.matKhau) {
      updateData.matKhau = data.matKhau;
    }

    const result = await prisma.nguoiDung.update({
      where: { maND },
      data: updateData
    });

    return { success: true, message: "Cập nhật người dùng thành công", data: serialize(result) };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi cập nhật người dùng" };
  }
}

export async function deleteNguoiDung(maND: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Prevents self-deletion
    if (session.user.id === maND) {
      return { success: false, message: "Bạn không thể tự xóa tài khoản của chính mình" };
    }

    await prisma.nguoiDung.delete({
      where: { maND }
    });
    return { success: true, message: "Xóa người dùng thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi xóa người dùng" };
  }
}
