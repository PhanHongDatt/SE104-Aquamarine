"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ruler, Edit2, Trash2, Plus, X, Loader2, AlertTriangle } from "lucide-react";
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
import { cn } from "@/lib/utils";

// Hàm trả về màu sắc dựa trên tên đơn vị tính để đồng bộ với Loại SP
const getUnitColor = (unitName: string) => {
  const name = unitName?.toLowerCase() || "";
  if (name.includes("chỉ") || name.includes("lượng") || name.includes("cây")) 
    return "bg-amber-100 text-amber-700 border-amber-200";
  if (name.includes("gram") || name.includes("g")) 
    return "bg-slate-100 text-zinc-700 border-zinc-200";
  if (name.includes("karat") || name.includes("ct") || name.includes("viên")) 
    return "bg-cyan-100 text-cyan-700 border-cyan-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
};

export default function AdminDonViTinhPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State cho Custom Delete Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: "",
  });

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

  const openDeleteDialog = (item: any) => {
    setDeleteConfirm({
      isOpen: true,
      id: item.maDVT,
      name: item.tenDVT,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteConfirm({ isOpen: false, id: null, name: "" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    
    const loadingToast = toast.loading("Đang thực hiện xóa...");
    try {
      const res = await deleteDonViTinh(deleteConfirm.id);
      toast.dismiss(loadingToast);
      
      if (res.success) {
        toast.success(res.message);
        loadData();
        closeDeleteDialog();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error("Lỗi khi thực hiện xóa");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-montserrat">
            <Ruler className="w-6 h-6 text-primary" />
            Quản Lý Đơn Vị Tính
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-zinc-500">Danh mục đơn vị đo lường trong hệ thống</p>
            <div className="flex items-center justify-center min-w-[120px] h-9 px-4 bg-primary/10 border border-primary/20 rounded-xl font-montserrat shadow-sm">
              <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider mr-2">Tổng số:</span>
              <span className="text-lg font-extrabold text-primary leading-none">{data.length}</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl shadow-md shadow-primary/20 h-11"
        >
          <Plus className="w-4 h-4" /> Thêm đơn vị
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left font-sans">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600 font-montserrat tracking-tight text-[13px]">
                  <th className="px-6 py-4 w-16 text-center uppercase">STT</th>
                  <th className="px-6 py-4 w-32 uppercase">Mã DVT</th>
                  <th className="px-6 py-4 uppercase text-center">Tên đơn vị</th>
                  <th className="px-6 py-4 text-right uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((item, index) => (
                  <tr key={item.maDVT} className="hover:bg-zinc-50/60 transition-colors group">
                    <td className="px-6 py-4 text-center text-zinc-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maDVT}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[11px] font-bold border tracking-wide uppercase font-montserrat",
                        getUnitColor(item.tenDVT)
                      )}>
                        {item.tenDVT}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-semibold text-xs border border-primary/10 shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Sửa
                        </button>
                        <button 
                          onClick={() => openDeleteDialog(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 font-semibold text-xs border border-red-100 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </div>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-xl font-bold text-zinc-900 font-montserrat tracking-tight">
                {editingId ? "Cập nhật ĐVT" : "Thêm đơn vị tính mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 font-sans">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Tên đơn vị tính</label>
                <Input
                  placeholder="Ví dụ: Chỉ, Gram, Karat..."
                  error={errors.tenDVT?.message}
                  {...register("tenDVT")}
                  className="rounded-xl border-zinc-200 focus:border-primary h-11 font-medium shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 h-11 font-semibold text-zinc-600 border-zinc-200">
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 h-11 shadow-lg shadow-primary/30 bg-primary text-white font-bold hover:translate-y-[-1px] transition-transform active:translate-y-0">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Cập nhật" : "Lưu dữ liệu")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/20 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-200/50">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 font-montserrat">Xác nhận xóa?</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Bạn có chắc chắn muốn xóa đơn vị tính <span className="font-bold text-zinc-800">"{deleteConfirm.name}"</span>? 
                  <br />Hành động này không thể hoàn tác.
                </p>
              </div>
              
              <div className="flex flex-col gap-2 pt-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
                >
                  Đồng ý xóa
                </button>
                <button 
                  onClick={closeDeleteDialog}
                  className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-bold transition-all active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
