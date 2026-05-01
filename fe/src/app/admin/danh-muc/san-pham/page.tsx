"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Package, Edit2, Trash2, Plus, X, Loader2, 
  Coins, Scale, Info, AlertCircle, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";

import { 
  getSanPhams, 
  createSanPham, 
  updateSanPham, 
  deleteSanPham 
} from "@/actions/san-pham.action";
import { getLoaiSanPhams } from "@/actions/loai-san-pham.action";
import { getDonViTinhs } from "@/actions/don-vi-tinh.action";
import { sanPhamSchema, type SanPhamInput, HAM_LUONG_ENUM } from "@/schemas/san-pham.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const HAM_LUONG_STYLE: Record<string, string> = {
  K24: "bg-amber-100 text-amber-700 border-amber-200",
  K22: "bg-orange-100 text-orange-700 border-orange-200",
  K18: "bg-yellow-50 text-yellow-700 border-yellow-200",
  K14: "bg-slate-100 text-slate-700 border-slate-200",
  K10: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function AdminSanPhamPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State cho Custom Delete Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false, id: null, name: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SanPhamInput>({
    resolver: zodResolver(sanPhamSchema),
    defaultValues: { tonToiThieu: 1 }
  });

  const selectedLSP = watch("maLSP");
  const importPrice = watch("donGiaNhap");

  // Logic tự động gán & kiểm tra DVT
  const currentCategory = categories.find(c => c.maLSP === selectedLSP);
  const currentUnit = units.find(u => u.maDVT === currentCategory?.maDVT);

  useEffect(() => {
    if (currentCategory && currentUnit) {
      const tenLoai = currentCategory.tenLSP.toLowerCase();
      const tenDVT = currentUnit.tenDVT.toLowerCase();
      let isValid = true;

      if (tenLoai.includes("miếng") && !(tenDVT.includes("lượng") || tenDVT.includes("chỉ"))) isValid = false;
      else if (tenLoai.includes("nữ trang") && !(tenDVT.includes("gram") || tenDVT.includes("chỉ"))) isValid = false;

      if (isValid) setValue("maDVT", currentCategory.maDVT);
      else {
        toast.error(`Đơn vị "${currentUnit.tenDVT}" không hợp lệ cho loại "${currentCategory.tenLSP}"`);
        setValue("maDVT", "");
      }
    }
  }, [currentCategory, currentUnit, setValue]);

  const sellingPricePreview = (() => {
    if (!importPrice || !currentCategory || importPrice < 0) return 0;
    return Number(importPrice) * (1 + Number(currentCategory.phanTramLoiNhuan) / 100);
  })();

  const loadData = async () => {
    setLoading(true);
    const [resSP, resLSP, resUnits] = await Promise.all([getSanPhams(), getLoaiSanPhams(), getDonViTinhs()]);
    if (resSP.success) setData(resSP.data);
    if (resLSP.success) setCategories(resLSP.data);
    if (resUnits.success) setUnits(resUnits.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (values: SanPhamInput) => {
    try {
      let res;
      if (editingId) {
        res = await updateSanPham(editingId, values);
      } else {
        res = await createSanPham(values);
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
      toast.error("Lỗi hệ thống");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.maSP);
    setValue("tenSP", item.tenSP);
    setValue("maLSP", item.maLSP);
    setValue("hamLuong", item.hamLuong);
    setValue("trongLuong", Number(item.trongLuong));
    setValue("donGiaNhap", Number(item.donGiaNhap));
    setValue("tonToiThieu", item.tonToiThieu);
    setValue("maDVT", item.maDVT);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (item: any) => {
    setDeleteConfirm({ isOpen: true, id: item.maSP, name: item.tenSP });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    const res = await deleteSanPham(deleteConfirm.id);
    if (res.success) {
      toast.success(res.message);
      loadData();
      setDeleteConfirm({ isOpen: false, id: null, name: "" });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-montserrat uppercase">
            <Package className="w-6 h-6 text-primary" />
            Kho Sản Phẩm
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-zinc-500 font-medium">Danh mục hàng hóa và định giá bán</p>
            <div className="flex items-center justify-center h-9 px-4 bg-primary/10 border border-primary/20 rounded-xl font-montserrat">
              <span className="text-[11px] font-bold text-primary/60 uppercase mr-2">Tổng kho:</span>
              <span className="text-lg font-black text-primary">{data.length}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-medium">Đang kiểm kê kho hàng...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left font-sans">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-montserrat text-[12px] uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-5 font-bold text-center w-16">STT</th>
                  <th className="px-6 py-5 font-bold">Mã & Tên Sản Phẩm</th>
                  <th className="px-6 py-4 font-bold">Loại SP</th>
                  <th className="px-6 py-4 font-bold text-center">Hàm lượng</th>
                  <th className="px-6 py-4 font-bold text-right">Tồn kho</th>
                  <th className="px-6 py-4 font-bold text-right text-primary">Giá Bán</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((item, index) => (
                  <tr key={item.maSP} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-center text-zinc-400 font-mono">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase leading-none mb-1">{item.maSP}</span>
                        <span className="font-bold text-zinc-800 text-sm">{item.tenSP}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-bold border border-zinc-200">
                        {item.loaiSanPham?.tenLSP}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase font-montserrat", HAM_LUONG_STYLE[item.hamLuong])}>
                        {item.hamLuong}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn("font-bold text-sm", item.tonKho === 0 ? "text-red-600" : item.tonKho <= item.tonToiThieu ? "text-amber-500" : "text-green-600")}>
                          {item.tonKho} {item.donViTinh?.tenDVT}
                        </span>
                        {item.tonKho === 0 ? (
                          <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded border border-red-100 mt-1">Hết hàng</span>
                        ) : item.tonKho <= item.tonToiThieu ? (
                          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 mt-1">Sắp hết hàng</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-primary font-montserrat text-sm tracking-tight">
                        {formatCurrency(Number(item.donGiaBan))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 my-auto">
            <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 font-montserrat tracking-tight uppercase">
                    {editingId ? "Cập nhật sản phẩm" : "THÊM SẢN PHẨM MỚI"}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Vui lòng nhập đầy đủ thông tin bên dưới</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 rounded-full hover:bg-zinc-200 text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-10 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1">Tên sản phẩm</label>
                    <Input placeholder="Ví dụ: Nhẫn vàng trơn 9999..." error={errors.tenSP?.message} {...register("tenSP")} className="rounded-2xl h-12 border-zinc-200 focus:border-primary font-medium" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1">Loại sản phẩm</label>
                    <select {...register("maLSP")} disabled={!!editingId} className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-zinc-700 shadow-sm cursor-pointer disabled:bg-zinc-50">
                      <option value="">-- Chọn loại --</option>
                      {categories.map(c => <option key={c.maLSP} value={c.maLSP}>{c.tenLSP}</option>)}
                    </select>
                    {errors.maLSP && <p className="text-xs text-red-500 mt-1 ml-1">{errors.maLSP.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 ml-1">Hàm lượng</label>
                      <select {...register("hamLuong")} className="w-full h-12 px-4 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-zinc-700 shadow-sm">
                        {HAM_LUONG_ENUM.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 ml-1">Đơn vị tính</label>
                      <div className={cn(
                        "h-12 flex items-center px-4 border rounded-2xl font-bold text-xs uppercase tracking-tight transition-colors",
                        watch("maDVT") ? "bg-primary/[0.03] border-primary/20 text-primary" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                      )}>
                        {watch("maDVT") ? `${watch("maDVT")} - ${currentUnit?.tenDVT}` : "Tự động gán"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-zinc-400" /> Trọng lượng (Không âm)
                    </label>
                    <Input type="number" step="0.001" min="0.001" error={errors.trongLuong?.message} {...register("trongLuong")} className="rounded-2xl h-12 font-mono font-bold shadow-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-zinc-400" /> Đơn giá nhập (VNĐ)
                    </label>
                    <Input type="number" min="1000" error={errors.donGiaNhap?.message} {...register("donGiaNhap")} className="rounded-2xl h-12 font-mono font-bold text-primary shadow-sm" />
                  </div>

                  <div className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 relative overflow-hidden">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1.5">Giá bán tự tính (VNĐ)</p>
                    <p className="text-3xl font-black text-primary font-montserrat tracking-tighter leading-none">
                      {sellingPricePreview > 0 ? formatCurrency(sellingPricePreview) : "---"}
                    </p>
                    <div className="h-px bg-primary/10 my-3 w-full" />
                    <p className="text-[9px] text-zinc-500 flex items-center gap-1 font-medium">
                      <Info className="w-3 h-3 text-zinc-400" /> Tự động tính dựa trên % lợi nhuận của loại SP
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-10 pt-8 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-400 font-montserrat">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-tight">
                    {editingId ? `Đang sửa mã ${editingId}` : "Hệ thống sẽ tự sinh mã SP"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl px-10 h-12 font-bold text-zinc-500 border-zinc-200">Hủy</Button>
                  <Button type="submit" disabled={isSubmitting} className="rounded-2xl px-12 h-12 bg-primary text-white font-black shadow-xl shadow-primary/30 hover:translate-y-[-2px] active:translate-y-0 transition-all uppercase tracking-tighter">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận Nhập kho"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/20 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-200/50">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 font-montserrat">Xóa sản phẩm?</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Xác nhận xóa <span className="font-bold text-zinc-800">"{deleteConfirm.name}"</span>?
                  <br />Nếu đã có giao dịch, hành động này sẽ bị chặn.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <button onClick={handleConfirmDelete} className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.98]">Đồng ý xóa</button>
                <button onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: "" })} className="w-full h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-bold transition-all active:scale-[0.98]">Hủy bỏ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
