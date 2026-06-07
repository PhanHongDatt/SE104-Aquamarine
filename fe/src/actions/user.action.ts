"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { nextSequentialId, withUniqueRetry } from "@/lib/id-generation";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";
import { changePasswordSchema, registerUserSchema, userSchema, userUpdateSchema } from "@/schemas/user.schema";
import { MANAGER_GROUP_CODE } from "@/lib/permissions";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

async function canManageUsers(hanhDong: string = ACTIONS.VIEW) {
  const session = await getServerSession(authOptions);
  return {
    session,
    allowed: await hasPermission(PERMISSIONS.USER_MGMT, hanhDong, session),
  };
}

export async function getDanhSachNguoiDung() {
  const auth = await canManageUsers(ACTIONS.VIEW);
  if (!auth.allowed) return [];

  const data = await prisma.nguoiDung.findMany({
    include: { nhomNguoiDung: true },
    orderBy: { maND: 'asc' }
  });
  return serialize(data);
}

export async function getDanhSachNhomNguoiDung() {
  const auth = await canManageUsers(ACTIONS.VIEW);
  if (!auth.allowed) return [];

  const data = await prisma.nhomNguoiDung.findMany({
    orderBy: { maNhom: 'asc' }
  });
  return serialize(data);
}

export async function createNguoiDung(data: any) {
  try {
    const auth = await canManageUsers(ACTIONS.CREATE);
    if (!auth.allowed) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }
    const validated = userSchema.parse(data);

    const hashedPassword = await bcrypt.hash(validated.matKhau, 10);
    const result = await withUniqueRetry(async () => {
      const lastUser = await prisma.nguoiDung.findFirst({
        orderBy: { maND: 'desc' }
      });
      const maND = nextSequentialId(lastUser?.maND, "ND", 4);

      return prisma.nguoiDung.create({
        data: {
          maND,
          tenDangNhap: validated.tenDangNhap,
          matKhau: hashedPassword,
          hoTen: validated.hoTen,
          maNhom: validated.maNhom,
        }
      });
    });

    return { success: true, message: "Tạo tài khoản người dùng thành công", data: serialize(result) };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: "Tên đăng nhập đã tồn tại" };
    }
    return { success: false, message: "Lỗi khi tạo người dùng" };
  }
}

export async function registerNguoiDung(data: any) {
  try {
    // Chỉ Quản lý mới có quyền tạo tài khoản mới
    const session = await getServerSession(authOptions);
    if (!(await hasPermission(PERMISSIONS.USER_MGMT, ACTIONS.CREATE, session))) {
      return { success: false, message: "Bạn không có quyền tạo tài khoản" };
    }

    const validated = registerUserSchema.parse(data);
    const hashedPassword = await bcrypt.hash(validated.matKhau, 10);

    await prisma.nhomNguoiDung.upsert({
      where: { maNhom: "NHANVI" },
      update: {},
      create: { maNhom: "NHANVI", tenNhom: "NHAN_VIEN" },
    });

    const result = await withUniqueRetry(async () => {
      const lastUser = await prisma.nguoiDung.findFirst({
        orderBy: { maND: "desc" },
      });
      const maND = nextSequentialId(lastUser?.maND, "ND", 4);

      return prisma.nguoiDung.create({
        data: {
          maND,
          tenDangNhap: validated.tenDangNhap,
          matKhau: hashedPassword,
          hoTen: validated.hoTen,
          maNhom: "NHANVI",
        },
      });
    });

    return { success: true, message: "Đăng ký tài khoản thành công. Vui lòng đăng nhập.", data: serialize(result) };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Tên đăng nhập đã tồn tại" };
    }
    return { success: false, message: error?.errors?.[0]?.message || "Lỗi khi đăng ký tài khoản" };
  }
}

export async function getCurrentNguoiDungProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const data = await prisma.nguoiDung.findUnique({
    where: { maND: session.user.id },
    select: {
      maND: true,
      tenDangNhap: true,
      hoTen: true,
      maNhom: true,
      createdAt: true,
      nhomNguoiDung: true,
    },
  });

  return data ? serialize(data) : null;
}

export async function updateOwnPassword(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Phiên đăng nhập không hợp lệ" };
    }

    const validated = changePasswordSchema.parse(data);
    const user = await prisma.nguoiDung.findUnique({
      where: { maND: session.user.id },
    });
    if (!user) {
      return { success: false, message: "Không tìm thấy tài khoản" };
    }

    const oldPasswordMatches = /^\$2[aby]\$\d{2}\$/.test(user.matKhau)
      ? await bcrypt.compare(validated.matKhauCu, user.matKhau)
      : user.matKhau === validated.matKhauCu;

    if (!oldPasswordMatches) {
      return { success: false, message: "Mật khẩu hiện tại không đúng" };
    }

    await prisma.nguoiDung.update({
      where: { maND: user.maND },
      data: { matKhau: await bcrypt.hash(validated.matKhauMoi, 10) },
    });

    return { success: true, message: "Đổi mật khẩu thành công" };
  } catch (error: any) {
    return { success: false, message: error?.errors?.[0]?.message || "Lỗi khi đổi mật khẩu" };
  }
}

export async function updateNguoiDung(maND: string, data: any) {
  try {
    const auth = await canManageUsers(ACTIONS.UPDATE);
    if (!auth.allowed) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }
    const validated = userUpdateSchema.parse(data);

    const updateData: any = {
      hoTen: validated.hoTen,
      maNhom: validated.maNhom,
    };

    if (validated.matKhau) {
      updateData.matKhau = await bcrypt.hash(validated.matKhau, 10);
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentUser = await tx.nguoiDung.findUnique({ where: { maND } });
      if (!currentUser) throw new Error("Không tìm thấy tài khoản");

      if (currentUser.maNhom === MANAGER_GROUP_CODE && validated.maNhom !== MANAGER_GROUP_CODE) {
        const managerCount = await tx.nguoiDung.count({ where: { maNhom: MANAGER_GROUP_CODE } });
        if (managerCount <= 1) {
          throw new Error("Phải duy trì ít nhất một tài khoản thuộc nhóm Quản lý");
        }
      }

      return tx.nguoiDung.update({
        where: { maND },
        data: updateData,
      });
    }, { isolationLevel: "Serializable" });

    return { success: true, message: "Cập nhật người dùng thành công", data: serialize(result) };
  } catch (error: any) {
    return { success: false, message: error?.message || "Lỗi khi cập nhật người dùng" };
  }
}

export async function deleteNguoiDung(maND: string) {
  try {
    const auth = await canManageUsers(ACTIONS.DELETE);
    if (!auth.allowed) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Prevents self-deletion
    if (auth.session?.user.id === maND) {
      return { success: false, message: "Bạn không thể tự xóa tài khoản của chính mình" };
    }
    await prisma.$transaction(async (tx) => {
      const target = await tx.nguoiDung.findUnique({ where: { maND } });
      if (!target) throw new Error("Không tìm thấy tài khoản");

      if (target.maNhom === MANAGER_GROUP_CODE) {
        const managerCount = await tx.nguoiDung.count({ where: { maNhom: MANAGER_GROUP_CODE } });
        if (managerCount <= 1) {
          throw new Error("Phải duy trì ít nhất một tài khoản thuộc nhóm Quản lý");
        }
      }

      await tx.nguoiDung.delete({ where: { maND } });
    }, { isolationLevel: "Serializable" });
    return { success: true, message: "Xóa người dùng thành công" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Lỗi khi xóa người dùng" };
  }
}
