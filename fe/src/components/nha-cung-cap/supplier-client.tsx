"use client";

import { useState } from "react";
import { Truck, Plus, Search, Edit2, Phone, User as UserIcon, MapPin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { NhaCungCap } from "@/types/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SupplierForm } from "./supplier-form";
import { createNhaCungCap, deleteNhaCungCap, updateNhaCungCap } from "@/actions/nha-cung-cap.action";
import { type NhaCungCapFormValues } from "@/schemas/nha-cung-cap.schema";
import { usePermissions } from "@/hooks/use-permissions";

interface SupplierClientProps {
  initialData: NhaCungCap[];
}

export function SupplierClient({ initialData }: SupplierClientProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("DM_NCC", "THEM");
  const canUpdate = hasPermission("DM_NCC", "SUA");
  const canDelete = hasPermission("DM_NCC", "XOA");
  const [data, setData] = useState<NhaCungCap[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<NhaCungCap | null>(null);

  const filteredData = data.filter(
    (item) =>
      item.tenNCC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.maNCC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.soDienThoai.includes(searchTerm)
  );

  const handleAdd = () => {
    if (!canCreate) {
      toast.error("Bạn không có quyền thực hiện chức năng này.");
      return;
    }
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: NhaCungCap) => {
    if (!canUpdate) {
      toast.error("Bạn không có quyền thực hiện chức năng này.");
      return;
    }
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const onSubmit = async (values: NhaCungCapFormValues) => {
    try {
      let res;
      if (editingSupplier) {
        res = await updateNhaCungCap(editingSupplier.maNCC, values);
      } else {
        res = await createNhaCungCap(values);
      }
      
      if (res.success) {
        toast.success(res.message);
        setIsModalOpen(false);
        router.refresh();
        // Optimistic update local state
        if (editingSupplier) {
          setData(prev => prev.map(item => item.maNCC === editingSupplier.maNCC ? { ...item, ...values } : item));
        } else if (res.data) {
          setData(prev => [...prev, res.data as NhaCungCap]);
        }
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Không thể lưu thông tin. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (supplier: NhaCungCap) => {
    if (!canDelete) {
      toast.error("Bạn không có quyền thực hiện chức năng này.");
      return;
    }
    if (!window.confirm(`Xóa nhà cung cấp "${supplier.tenNCC}"? Các phiếu mua cũ vẫn được giữ lịch sử.`)) return;

    const res = await deleteNhaCungCap(supplier.maNCC);
    if (res.success) {
      toast.success(res.message);
      setData((prev) => prev.filter((item) => item.maNCC !== supplier.maNCC));
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Nhà cung cấp
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Danh sách các đối tác cung ứng vàng bạc đá quý</p>
        </div>
        {canCreate && (
          <Button onClick={handleAdd} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhà cung cấp
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Tìm theo mã, tên hoặc số điện thoại..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                <Truck className="w-6 h-6 text-zinc-300" />
             </div>
             <p className="italic">Không tìm thấy dữ liệu nhà cung cấp phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
	                  <th className="px-6 py-4 text-center w-16">STT</th>
	                  <th className="px-6 py-4">Mã nhà cung cấp</th>
	                  <th className="px-6 py-4">Tên nhà cung cấp</th>
	                  <th className="px-6 py-4">Địa chỉ</th>
	                  <th className="px-6 py-4">Số điện thoại</th>
	                  <th className="px-6 py-4">Người liên hệ</th>
	                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
	                {filteredData.map((item, index) => (
	                  <tr key={item.maNCC} className="group hover:bg-zinc-50/60 transition-colors">
	                    <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
	                    <td className="px-6 py-4">
	                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-100 w-fit px-1.5 py-0.5 rounded">
	                        {item.maNCC}
	                      </span>
	                    </td>
	                    <td className="px-6 py-4 font-bold text-zinc-900">{item.tenNCC}</td>
	                    <td className="px-6 py-4 max-w-[300px]">
	                       <div className="flex gap-2 text-zinc-500 line-clamp-2">
	                          <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
	                          <span className="text-xs leading-relaxed">{item.diaChi}</span>
	                       </div>
	                    </td>
	                    <td className="px-6 py-4">
	                      <div className="flex items-center gap-2 text-zinc-600">
	                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
	                        <span>{item.soDienThoai}</span>
	                      </div>
	                    </td>
	                    <td className="px-6 py-4">
	                      <div className="flex items-center gap-2 text-zinc-600">
	                        <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
	                        <span>{item.nguoiLienHe}</span>
	                      </div>
	                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-semibold text-xs border border-primary/10 shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Sửa
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 font-semibold text-xs border border-red-100 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
      >
        <SupplierForm
          initialData={editingSupplier}
          onSubmit={onSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
