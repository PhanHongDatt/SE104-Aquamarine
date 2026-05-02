"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Wrench, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceTypeForm } from "@/components/forms/service-type-form";
import { deleteLoaiDichVu } from "@/actions/service.action";

interface ServiceTypeListProps {
  initialData: any[];
}

export function ServiceTypeList({ initialData }: ServiceTypeListProps) {
  const router = useRouter();
  const [isModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleEdit = (s: any) => {
    setSelectedService(s);
    setIsServiceModalOpen(true);
  };

  const handleDelete = async (maDV: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại dịch vụ này?")) return;

    try {
      const res = await deleteLoaiDichVu(maDV);
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
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedService(null);
            setIsServiceModalOpen(true);
          }} 
          className="rounded-xl font-bold gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm loại dịch vụ
        </Button>
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
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-primary transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.maDV)}
                          className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        onClose={() => setIsServiceModalOpen(false)}
        title={selectedService ? "Chỉnh sửa loại dịch vụ" : "Thêm loại dịch vụ mới"}
      >
        <ServiceTypeForm 
          initialData={selectedService} 
          onSuccess={() => setIsServiceModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
