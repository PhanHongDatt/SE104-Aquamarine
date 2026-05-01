"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ruler, Edit2, Trash2, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { 
  getDonViTinhs, 
  createDonViTinh, 
  updateDonViTinh, 
  deleteDonViTinh 
} from "@/actions/don-vi-tinh.action";
import { donViTinhSchema, type DonViTinhInput } from "@/schemas/don-vi-tinh.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDonViTinhPage() {
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
    try {
      const res = await getDonViTinhs();
      if (res.success) {
        setData(res.data);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi kết nối Server Action");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: DonViTinhInput) => {
    try {
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
    } catch (e) {
      toast.error("Đã xảy ra lỗi hệ thống");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.maDVT);
    setValue("tenDVT", item.tenDVT);
    setIsModalOpen(true);
  };

  const handleDelete = async (maDVT: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn vị tính này?")) return;

    try {
      const res = await deleteDonViTinh(maDVT);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi khi thực hiện xóa");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" />
            Quản Lý Đơn Vị Tính
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-zinc-500">Danh mục đơn vị đo lường trong hệ thống (Admin)</p>
            <div className="flex items-center justify-center min-w-[120px] h-9 px-4 bg-primary/10 border border-primary/20 rounded-xl font-montserrat shadow-sm">
              <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider mr-2">Tổng số:</span>
              <span className="text-lg font-extrabold text-primary leading-none">{data.length}</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Thêm đơn vị
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden font-sans">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            Chưa có dữ liệu đơn vị tính.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600 font-montserrat tracking-tight text-[13px]">
                  <th className="px-6 py-4 w-16 text-center uppercase">STT</th>
                  <th className="px-6 py-4 w-32 uppercase">Mã DVT</th>
                  <th className="px-6 py-4 uppercase">Tên đơn vị tính</th>
                  <th className="px-6 py-4 text-right uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((item, index) => (
                  <tr key={item.maDVT} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 text-center text-zinc-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maDVT}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-800">{item.tenDVT}</td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.maDVT)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900 font-montserrat tracking-tight">
                {editingId ? "Sửa đơn vị tính" : "Thêm đơn vị tính mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 font-sans">
              <Input
                label="Tên đơn vị tính"
                placeholder="Ví dụ: Chỉ, Gram, Cái..."
                error={errors.tenDVT?.message}
                {...register("tenDVT")}
                className="font-medium"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-6 shadow-md shadow-primary/20 text-white bg-primary hover:bg-primary-hover">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                    </span>
                  ) : (
                    editingId ? "Cập nhật" : "Lưu lại"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
