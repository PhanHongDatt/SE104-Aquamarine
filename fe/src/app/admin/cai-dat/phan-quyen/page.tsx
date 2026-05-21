import { Shield } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDanhSachNguoiDung, getDanhSachNhomNguoiDung } from "@/actions/user.action";
import { UserManagementList } from "@/components/forms/user-management-list";
import { getBangPhanQuyen, getChucNangs } from "@/actions/phan-quyen.action";
import { PermissionMatrix } from "@/components/forms/permission-matrix";

export const metadata = { title: "Phân quyền người dùng – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminPhanQuyenPage() {
  const session = await getServerSession(authOptions);
  
  // Security check: Only QUAN_LY can access this management page
  if (session?.user?.role !== "QUAN_LY") {
    redirect("/admin/dashboard");
  }

  const users = await getDanhSachNguoiDung();
  const groups = await getDanhSachNhomNguoiDung();
  const permissions = await getChucNangs();
  const initialPermissions = Object.fromEntries(
    await Promise.all(
      groups.map(async (group: any) => [group.maNhom, await getBangPhanQuyen(group.maNhom)])
    )
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Phân quyền người dùng
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Quản lý tài khoản nhân viên và các nhóm quyền truy cập hệ thống</p>
      </div>

      <PermissionMatrix groups={groups} permissions={permissions} initialPermissions={initialPermissions} />
      <UserManagementList users={users} groups={groups} />
    </div>
  );
}
