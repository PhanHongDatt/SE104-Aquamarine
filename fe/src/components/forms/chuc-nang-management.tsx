"use client";

import { useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { ChucNangForm } from "@/components/forms/chuc-nang-form";
import { deleteChucNang } from "@/actions/phan-quyen.action";
import { usePermissions } from "@/hooks/use-permissions";

interface ChucNangManagementProps {
  chucNangs: any[];
}

export function ChucNangManagement({ chucNangs }: ChucNangManagementProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("HT_PHQ", "SUA");
  const canDelete = hasPermission("HT_PHQ", "XOA");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChucNang, setSelectedChucNang] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (cn: any) => {
    setSelectedChucNang(cn);
    setIsModalOpen(true);
  };

  const handleDelete = async (maChucNang: string, tenChucNang: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chức năng "${tenChucNang}"? Các phân quyền liên quan cũng sẽ bị xóa.`)) return;

    try {
      const res = await deleteChucNang(maChucNang);
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

  const filteredData = chucNangs.filter((cn) =>
    cn.tenChucNang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cn.maChucNang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cn.tenManHinhDuocLoad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="chuc-nang-search"
            name="chucNangSearch"
            type="text"
            placeholder="Tìm theo mã, tên hoặc đường dẫn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <p className="text-xs text-zinc-500 max-w-lg">
          Chức năng hệ thống gắn với màn hình và kiểm tra quyền trong mã nguồn, không thể tạo hoặc sửa trực tiếp tại đây.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                <th className="px-6 py-4 w-24">Mã</th>
                <th className="px-6 py-4">Tên chức năng</th>
                <th className="px-6 py-4">Đường dẫn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">
                    Không tìm thấy chức năng nào.
                  </td>
                </tr>
              ) : (
                filteredData.map((cn) => (
                  <tr key={cn.maChucNang} className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400 uppercase">{cn.maChucNang}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{cn.tenChucNang}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono">{cn.tenManHinhDuocLoad}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canUpdate && !["DM_DVT", "DM_LSP", "DM_SP", "DM_KH", "DM_NCC", "GD_BAN", "GD_MUA", "DV_LAP", "DV_LDV", "DV_TRA", "BC_TON", "BC_DTH", "HT_USR", "HT_PHQ", "HT_QDI", "HT_BAK"].includes(cn.maChucNang) && (
                          <button
                            onClick={() => handleEdit(cn)}
                            className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-primary transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && !["DM_DVT", "DM_LSP", "DM_SP", "DM_KH", "DM_NCC", "GD_BAN", "GD_MUA", "DV_LAP", "DV_LDV", "DV_TRA", "BC_TON", "BC_DTH", "HT_USR", "HT_PHQ", "HT_QDI", "HT_BAK"].includes(cn.maChucNang) && (
                          <button
                            onClick={() => handleDelete(cn.maChucNang, cn.tenChucNang)}
                            className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-600 transition-colors"
                            title="Xóa"
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
        title={selectedChucNang ? "Cập nhật chức năng" : "Tạo chức năng mới"}
      >
        <ChucNangForm
          initialData={selectedChucNang}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
