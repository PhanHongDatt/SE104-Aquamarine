"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Edit2, Trash2, Plus, X, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";

import { getLoaiSanPhams } from "@/actions/loai-san-pham.action";
import { getDonViTinhs } from "@/actions/don-vi-tinh.action";
import { loaiSanPhamSchema, type LoaiSanPhamInput } from "@/schemas/loai-san-pham.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Hàm trả về màu sắc dựa trên tên đơn vị tính để phân loại thị giác
const getUnitColor = (unitName: string) => {
  const name = unitName?.toLowerCase() || "";
  if (name.includes("chỉ") || name.includes("lượng") || name.includes("cây")) 
    return "bg-amber-100 text-amber-700 border-amber-200"; // Vàng
  if (name.includes("gram") || name.includes("g")) 
    return "bg-slate-100 text-zinc-700 border-zinc-200"; // Bạc/Kim loại
  if (name.includes("karat") || name.includes("ct") || name.includes("viên")) 
    return "bg-cyan-100 text-cyan-700 border-cyan-200"; // Đá quý
  return "bg-zinc-100 text-zinc-600 border-zinc-200"; // Mặc định
};

export default function AdminLoaiSanPhamPage() {
  const [data, setData] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoaiSanPhamInput>({
    resolver: zodResolver(loaiSanPhamSchema),
  });

  const loadData = async () => {
    setLoading(true);
    const [resLSP, resUnits] = await Promise.all([
      getLoaiSanPhams(),
      getDonViTinhs()
    ]);
    if (resLSP.success) setData(resLSP.data);
    if (resUnits.success) setUnits(resUnits.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: LoaiSanPhamInput) => {
    toast.info("Đang triển khai logic xử lý tại Server...");
    console.log("Form values:", values);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.maLSP);
    setValue("tenLSP", item.tenLSP);
    setValue("maDVT", item.maDVT);
    setValue("phanTramLoiNhuan", Number(item.phanTramLoiNhuan));
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-montserrat">
            <Box className="w-6 h-6 text-primary" />
            Quản Lý Loại Sản Phẩm
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-zinc-500 font-sans">Cấu hình danh mục và biên độ lợi nhuận</p>
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
          <Plus className="w-4 h-4" /> Thêm loại mới
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden font-sans">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600 font-montserrat tracking-tight text-[13px]">
                  <th className="px-6 py-4 w-16 text-center uppercase">STT</th>
                  <th className="px-6 py-4 w-32 uppercase">Mã loại</th>
                  <th className="px-6 py-4 uppercase">Tên loại sản phẩm</th>
                  <th className="px-6 py-4 uppercase text-center">Đơn vị tính</th>
                  <th className="px-6 py-4 text-right uppercase">% Lợi nhuận</th>
                  <th className="px-6 py-4 text-right uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((item, index) => {
                  const unitName = item.donViTinh?.tenDVT || item.maDVT;
                  return (
                    <tr key={item.maLSP} className="hover:bg-zinc-50/60 transition-colors group">
                      <td className="px-6 py-4 text-center text-zinc-400 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maLSP}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-800">{item.tenLSP}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase",
                          getUnitColor(unitName)
                        )}>
                          {unitName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary font-montserrat text-base">
                        {item.phanTramLoiNhuan}%
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
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 font-semibold text-xs border border-red-100 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                {editingId ? "Cập nhật loại SP" : "Thêm loại sản phẩm"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 font-sans">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Tên loại sản phẩm</label>
                <Input
                  placeholder="Ví dụ: Vàng 24K, Kim cương..."
                  error={errors.tenLSP?.message}
                  {...register("tenLSP")}
                  className="rounded-xl border-zinc-200 focus:border-primary h-11 font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Đơn vị tính mặc định</label>
                <select
                  {...register("maDVT")}
                  className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold appearance-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {units.map(u => (
                    <option key={u.maDVT} value={u.maDVT}>{u.tenDVT}</option>
                  ))}
                </select>
                {errors.maDVT && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.maDVT.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Phần trăm lợi nhuận định mức</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.00"
                    error={errors.phanTramLoiNhuan?.message}
                    {...register("phanTramLoiNhuan")}
                    className="rounded-xl border-zinc-200 focus:border-primary h-11 pr-10 font-bold text-primary shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 mt-2">
                  <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                    Công thức: <span className="font-bold text-zinc-700 italic">Đơn giá bán = Giá nhập × (1 + {watch("phanTramLoiNhuan") || "0"}%)</span>
                  </p>
                </div>
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
    </div>
  );
}
