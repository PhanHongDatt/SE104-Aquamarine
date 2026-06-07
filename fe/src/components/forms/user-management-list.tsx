"use client";

import { useState } from "react";
import { UserPlus, Pencil, Trash2, Shield, User, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { UserForm } from "@/components/forms/user-form";
import { deleteNguoiDung } from "@/actions/user.action";
import { usePermissions } from "@/hooks/use-permissions";

interface UserManagementListProps {
  users: any[];
  groups: any[];
}

export function UserManagementList({ users, groups }: UserManagementListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("HT_USR", "THEM");
  const canUpdate = hasPermission("HT_USR", "SUA");
  const canDelete = hasPermission("HT_USR", "XOA");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (u: any) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const handleDelete = async (maND: string, name: string) => {
    if (session?.user?.id === maND) {
      toast.error("Bạn không thể tự xóa chính mình");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản của "${name}"?`)) return;

    try {
      const res = await deleteNguoiDung(maND);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi xóa");
    }
  };

  const filteredUsers = users.filter(u => 
    u.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.tenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.maND.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="user-search"
            name="userSearch"
            type="text"
            placeholder="Tìm theo tên hoặc ID nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="rounded-2xl font-bold gap-2 h-11"
          >
            <UserPlus className="w-4 h-4" /> Tạo tài khoản mới
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Tên đăng nhập</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                    Không tìm thấy tài khoản nào.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.maND} className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400 uppercase">{u.maND}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-zinc-900">{u.hoTen}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{u.tenDangNhap}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        u.nhomNguoiDung.tenNhom === 'QUAN_LY'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {u.nhomNguoiDung.tenNhom === 'QUAN_LY' ? 'Quản lý' : u.nhomNguoiDung.tenNhom}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-primary transition-colors"
                            title="Sửa thông tin"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(u.maND, u.hoTen)}
                            className={`p-2 hover:bg-red-50 rounded-xl transition-colors ${
                              session?.user?.id === u.maND ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:text-red-600'
                            }`}
                            disabled={session?.user?.id === u.maND}
                            title={session?.user?.id === u.maND ? "Không thể xóa chính mình" : "Xóa tài khoản"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? "Cập nhật tài khoản" : "Tạo tài khoản nhân viên mới"}
      >
        <UserForm 
          groups={groups}
          initialData={selectedUser} 
          onSuccess={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
