"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ruler, Edit2, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { 
  getDonViTinhs, 
  createDonViTinh, 
  updateDonViTinh, 
  deleteDonViTinh,
  donViTinhSchema,
  type DonViTinhInput 
} from "@/actions/don-vi-tinh.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DonViTinhPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DonViTinhInput>({
    resolver: zodResolver(donViTinhSchema),
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getDonViTinhs();
    if (res.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: DonViTinhInput) => {
    let res;
    if (editingId) {
      res = await updateDonViTinh(editingId, values);
    } else {
      res = await createDonViTinh(values);
    }

    if (res.success) {
      toast.success(res.message);
      setIsModalOpen(false);
      reset();
      setEditingId(null);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.maDVT);
    setValue("tenDVT", item.tenDVT);
    setIsModalOpen(true);
  };

  const handleDelete = async (maDVT: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn vị tính này?")) return;

    const res = await deleteDonViTinh(maDVT);
    if (res.success) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" />
            Quản Lý Đơn Vị Tính
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Danh mục đơn vị đo lường trong hệ thống</p>
        </div>
        <Button 
          onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm đơn vị
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60">
                <th className="text-left px-6 py-4 font-semibold text-zinc-600 whitespace-nowrap">Mã DVT</th>
                <th className="text-left px-6 py-4 font-semibold text-zinc-600">Tên đơn vị tính</th>
                <th className="text-right px-6 py-4 font-semibold text-zinc-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((item) => (
                <tr key={item.maDVT} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maDVT}</td>
                  <td className="px-6 py-4 font-medium text-zinc-800">{item.tenDVT}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-zinc-400 hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.maDVT)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">
                {editingId ? "Sửa đơn vị tính" : "Thêm đơn vị tính mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <Input
                label="Tên đơn vị tính"
                placeholder="Ví dụ: Chỉ, Gram, Cái..."
                error={errors.tenDVT?.message}
                {...register("tenDVT")}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {editingId ? "Cập nhật" : "Lưu lại"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
