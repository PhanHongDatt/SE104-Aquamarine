"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Wrench, Search, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceTypeForm } from "@/components/forms/service-type-form";
import { deleteLoaiDichVu } from "@/actions/service.action";
import { usePermissions } from "@/hooks/use-permissions";

interface ServiceTypeListProps {
  initialData: any[];
}

export function ServiceTypeList({ initialData }: ServiceTypeListProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("DV_LDV", "THEM");
  const canUpdate = hasPermission("DV_LDV", "SUA");
  const canDelete = hasPermission("DV_LDV", "XOA");
  const showActions = canUpdate || canDelete;
  const [isModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleEdit = (s: any) => {
    setSelectedService(s);
    setIsServiceModalOpen(true);
  };

  const handleDeleteClick = (s: any) => {
    setDeleteTarget(s);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteLoaiDichVu(deleteTarget.maDV);
      if (res.success) {
        toast.success(res.message);
        setDeleteTarget(null);
        router.refresh();
      } else {
        setDeleteError(res.message);
      }
    } catch (error) {
      setDeleteError("Đã xảy ra lỗi hệ thống khi xóa");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = initialData.filter(s => 
    s.tenDV.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maDV.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="service-type-search"
            name="serviceTypeSearch"
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setSelectedService(null);
              setIsServiceModalOpen(true);
            }}
            className="rounded-xl font-bold gap-2"
          >
            <Plus className="w-4 h-4" /> Thêm loại dịch vụ
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                <th className="px-6 py-4">Mã DV</th>
                <th className="px-6 py-4">Tên dịch vụ</th>
                <th className="px-6 py-4">Nhóm</th>
                <th className="px-6 py-4 text-right">Đơn giá</th>
                {showActions && <th className="px-6 py-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 5 : 4} className="px-6 py-12 text-center text-zinc-500 italic">
                    Không tìm thấy loại dịch vụ nào.
                  </td>
                </tr>
              ) : (
                filteredData.map((s) => (
                  <tr key={s.maDV} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400 uppercase">{s.maDV}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{s.tenDV}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.nhomDV === 'GiaCong' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {s.nhomDV === 'GiaCong' ? 'Gia công' : 'Kiểm định'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-zinc-900">
                      {formatCurrency(Number(s.donGiaDV))}
                    </td>
                    {showActions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canUpdate && (
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-primary transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(s)}
                              className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={selectedService ? "Chỉnh sửa loại dịch vụ" : "Thêm loại dịch vụ mới"}
      >
        <ServiceTypeForm
          initialData={selectedService}
          onSuccess={() => setIsServiceModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-lg font-bold text-zinc-900">Xác nhận xóa</h3>
              <button
                onClick={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteError(null); } }}
                className="p-2 hover:bg-zinc-200/50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!deleteError ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Bạn có chắc chắn muốn xóa loại dịch vụ này?
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        <span className="font-bold text-zinc-700">{deleteTarget.tenDV}</span>
                        <span className="text-zinc-400 ml-1">({deleteTarget.maDV})</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-2">
                        Hành động này không thể hoàn tác. Nếu dịch vụ đang được sử dụng trong phiếu, hệ thống sẽ từ chối xóa.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                      disabled={isDeleting}
                      className="flex-1 h-11 rounded-xl"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleDeleteConfirm}
                      loading={isDeleting}
                      className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Không thể xóa</p>
                      <p className="text-sm text-zinc-600 mt-1">{deleteError}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                    className="w-full h-11 rounded-xl"
                  >
                    Đã hiểu
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
