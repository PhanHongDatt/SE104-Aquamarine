"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GroupForm } from "@/components/forms/group-form";
import { deleteNhomNguoiDung } from "@/actions/phan-quyen.action";
import { usePermissions } from "@/hooks/use-permissions";

interface GroupManagementProps {
  groups: any[];
}

const SYSTEM_GROUPS = ["QUANLY", "NHANVI"];

export function GroupManagement({ groups }: GroupManagementProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("HT_PHQ", "THEM");
  const canUpdate = hasPermission("HT_PHQ", "SUA");
  const canDelete = hasPermission("HT_PHQ", "XOA");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (g: any) => {
    setSelectedGroup(g);
    setIsModalOpen(true);
  };

  const handleDelete = async (maNhom: string, tenNhom: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm "${tenNhom}"?`)) return;

    try {
      const res = await deleteNhomNguoiDung(maNhom);
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

  const filteredGroups = groups.filter((g) =>
    g.tenNhom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.maNhom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="group-search"
            name="groupSearch"
            type="text"
            placeholder="Tìm theo mã hoặc tên nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedGroup(null);
              setIsModalOpen(true);
            }}
            className="rounded-2xl font-bold gap-2 h-11"
          >
            <Plus className="w-4 h-4" /> Tạo nhóm mới
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                <th className="px-6 py-4 w-24">Mã nhóm</th>
                <th className="px-6 py-4">Tên nhóm</th>
                <th className="px-6 py-4 text-center">Loại</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">
                    Không tìm thấy nhóm nào.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((g) => {
                  const isSystem = SYSTEM_GROUPS.includes(g.maNhom);
                  return (
                    <tr key={g.maNhom} className="hover:bg-zinc-50/60 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400 uppercase">{g.maNhom}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-zinc-900">{g.tenNhom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSystem ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-red-50 text-red-600 border-red-100">
                            Hệ thống
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-blue-50 text-blue-600 border-blue-100">
                            Tùy chỉnh
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canUpdate && !isSystem && (
                            <button
                              onClick={() => handleEdit(g)}
                              className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-primary transition-colors"
                              title="Sửa tên nhóm"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(g.maNhom, g.tenNhom)}
                              className={`p-2 hover:bg-red-50 rounded-xl transition-colors ${
                                isSystem ? "text-zinc-200 cursor-not-allowed" : "text-zinc-400 hover:text-red-600"
                              }`}
                              disabled={isSystem}
                              title={isSystem ? "Không thể xóa nhóm hệ thống" : "Xóa nhóm"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedGroup ? "Cập nhật nhóm người dùng" : "Tạo nhóm người dùng mới"}
      >
        <GroupForm
          initialData={selectedGroup}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
