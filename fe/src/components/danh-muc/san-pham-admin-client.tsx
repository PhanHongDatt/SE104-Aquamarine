"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
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
import { createLoaiSanPham, getLoaiSanPhams } from "@/actions/loai-san-pham.action";
import { getDonViTinhs } from "@/actions/don-vi-tinh.action";
import { sanPhamSchema, type SanPhamInput, HAM_LUONG_ENUM, HAM_LUONG_LABELS } from "@/schemas/san-pham.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { getAllowedHamLuongValuesForLoaiSP, getDefaultHamLuongForLoaiSP } from "@/lib/business-rules";

const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const HAM_LUONG_STYLE: Record<string, string> = {
  K24: "bg-amber-100 text-amber-700 border-amber-200",
  K22: "bg-orange-100 text-orange-700 border-orange-200",
  K18: "bg-yellow-50 text-yellow-700 border-yellow-200",
  K14: "bg-slate-100 text-slate-700 border-slate-200",
  K10: "bg-zinc-100 text-zinc-600 border-zinc-200",
  BAC_925: "bg-sky-100 text-sky-700 border-sky-200",
  KHONG_AP_DUNG: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export default function AdminSanPhamPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("DM_SP", "THEM");
  const canUpdate = hasPermission("DM_SP", "SUA");
  const canDelete = hasPermission("DM_SP", "XOA");
  const canCreateCategory = hasPermission("DM_LSP", "THEM");

  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState({ tenLSP: "", maDVT: "", phanTramLoiNhuan: 0 });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

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
    defaultValues: {}
  });

  const selectedLSP = watch("maLSP");
  const importPrice = watch("donGiaNhap");
  const selectedHamLuong = watch("hamLuong");

  const currentCategory = categories.find(c => c.maLSP === selectedLSP);
  const selectedDVT = watch("maDVT");
  const currentUnit = units.find(u => u.maDVT === selectedDVT);
  const validUnits = useMemo(
    () => currentCategory
      ? units.filter((unit) => unit.maDVT === currentCategory.maDVT)
      : [],
    [currentCategory, units],
  );
  const hamLuongOptions = useMemo(() => {
    if (!currentCategory) return [...HAM_LUONG_ENUM];
    return getAllowedHamLuongValuesForLoaiSP(currentCategory.tenLSP) ?? [...HAM_LUONG_ENUM];
  }, [currentCategory]);

  useEffect(() => {
    if (!currentCategory || validUnits.length === 0) {
      setValue("maDVT", "");
      return;
    }

    if (selectedDVT !== currentCategory.maDVT) {
      setValue("maDVT", validUnits[0].maDVT);
    }
  }, [currentCategory, selectedDVT, setValue, validUnits]);

  useEffect(() => {
    if (!currentCategory || hamLuongOptions.length === 0) return;
    if (!selectedHamLuong || !hamLuongOptions.includes(selectedHamLuong as any)) {
      setValue("hamLuong", getDefaultHamLuongForLoaiSP(currentCategory.tenLSP) as any);
    }
  }, [currentCategory, hamLuongOptions, selectedHamLuong, setValue]);

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

  const openCreateModal = () => {
    setEditingId(null);
    reset({
      tenSP: "",
      maLSP: "",
      hamLuong: "K24",
      trongLuong: 1,
      maDVT: "",
      donGiaNhap: 1000,
    });
    setIsModalOpen(true);
  };

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

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingCategory(true);
    const res = await createLoaiSanPham(categoryDraft);
    setIsCreatingCategory(false);

    if (res.success && res.data) {
      const unit = units.find((item) => item.maDVT === categoryDraft.maDVT);
      const newCategory = { ...res.data, donViTinh: unit };
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.maLSP.localeCompare(b.maLSP)));
      setValue("maLSP", res.data.maLSP);
      setCategoryDraft({ tenLSP: "", maDVT: "", phanTramLoiNhuan: 0 });
      setIsCategoryModalOpen(false);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.maSP);
    setValue("tenSP", item.tenSP);
    setValue("maLSP", item.maLSP);
    setValue("hamLuong", item.hamLuong);
    setValue("trongLuong", Number(item.trongLuong));
    setValue("donGiaNhap", Number(item.donGiaNhap));
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
        {canCreate && (
          <Button onClick={openCreateModal} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        )}
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
                  <th className="px-6 py-5 font-bold">Mã sản phẩm</th>
                  <th className="px-6 py-5 font-bold">Tên sản phẩm</th>
                  <th className="px-6 py-4 font-bold">Loại SP</th>
                  <th className="px-6 py-4 font-bold text-center">Hàm lượng</th>
                  <th className="px-6 py-4 font-bold text-right">Trọng lượng</th>
                  <th className="px-6 py-4 font-bold text-center">Đơn vị tính</th>
                  <th className="px-6 py-4 font-bold text-right">Đơn giá nhập</th>
                  <th className="px-6 py-4 font-bold text-right">% Lợi nhuận</th>
                  <th className="px-6 py-4 font-bold text-right text-primary">Đơn giá bán</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((item, index) => (
                  <tr key={item.maSP} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-center text-zinc-400 font-mono">{index + 1}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maSP}</td>
                    <td className="px-6 py-4 font-bold text-zinc-800 text-sm max-w-[220px] whitespace-normal break-words">
                      {item.tenSP}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block max-w-[180px] px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-bold border border-zinc-200 whitespace-normal break-words leading-tight">
                        {item.loaiSanPham?.tenLSP}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase font-montserrat", HAM_LUONG_STYLE[item.hamLuong])}>
                        {HAM_LUONG_LABELS[item.hamLuong as keyof typeof HAM_LUONG_LABELS] ?? item.hamLuong}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-600">{Number(item.trongLuong).toLocaleString("vi-VN")}</td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-700">{item.donViTinh?.tenDVT}</td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-700">
                      {formatCurrency(Number(item.donGiaNhap))}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {Number(item.loaiSanPham?.phanTramLoiNhuan ?? 0).toLocaleString("vi-VN")}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-primary font-montserrat text-sm tracking-tight">
                        {formatCurrency(Number(item.donGiaBan))}
                      </span>
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
                            onClick={() => openDeleteDialog(item)}
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
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                    {editingId ? "Chỉ được sửa tên và loại sản phẩm" : "Các trường có dấu * là bắt buộc"}
                  </p>
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
                    <label className="text-sm font-bold text-zinc-700 ml-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Input required placeholder="Ví dụ: Nhẫn vàng trơn 9999..." error={errors.tenSP?.message} {...register("tenSP")} className="rounded-2xl h-12 border-zinc-200 focus:border-primary font-medium" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-bold text-zinc-700 ml-1">
                        Loại sản phẩm <span className="text-red-500">*</span>
                      </label>
                      {canCreateCategory && !editingId && (
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          + Thêm loại
                        </button>
                      )}
                    </div>
                    <select {...register("maLSP")} required className="w-full max-w-full h-12 px-4 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-zinc-700 shadow-sm cursor-pointer disabled:bg-zinc-50 truncate overflow-hidden">
                      <option value="">-- Chọn loại --</option>
                      {categories.map(c => <option key={c.maLSP} value={c.maLSP} className="truncate" title={c.tenLSP}>{c.tenLSP}</option>)}
                    </select>
                    {errors.maLSP && <p className="text-xs text-red-500 mt-1 ml-1">{errors.maLSP.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 ml-1">
                        Hàm lượng/chỉ số <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("hamLuong")}
                        aria-disabled={!!editingId}
                        tabIndex={editingId ? -1 : undefined}
                        required
                        className={cn(
                          "w-full h-12 px-4 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-zinc-700 shadow-sm",
                          editingId && "pointer-events-none bg-zinc-50 text-zinc-500"
                        )}
                      >
                        {hamLuongOptions.map(h => <option key={h} value={h}>{HAM_LUONG_LABELS[h as keyof typeof HAM_LUONG_LABELS] ?? h}</option>)}
                      </select>
                      {editingId && <p className="text-[10px] text-zinc-400 mt-1">Tự điều chỉnh nếu loại mới không dùng chỉ số hiện tại.</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-700 ml-1">
                        Đơn vị tính <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("maDVT")}
                        disabled={!selectedLSP || validUnits.length === 0}
                        aria-disabled={!!editingId}
                        tabIndex={editingId ? -1 : undefined}
                        required
                        className={cn(
                          "w-full max-w-full h-12 px-4 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-zinc-700 shadow-sm cursor-pointer disabled:bg-zinc-50 truncate overflow-hidden",
                          editingId && "pointer-events-none bg-zinc-50 text-zinc-500"
                        )}
                        title={currentUnit ? currentUnit.tenDVT : undefined}
                      >
                        <option value="">-- Chọn ĐVT --</option>
                        {validUnits.map((unit) => (
                          <option key={unit.maDVT} value={unit.maDVT} className="truncate" title={unit.tenDVT}>
                            {unit.tenDVT}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-zinc-400 mt-1">Theo đơn vị mặc định của loại sản phẩm.</p>
                      {errors.maDVT && <p className="text-xs text-red-500 mt-1 ml-1">{errors.maDVT.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-zinc-400" /> Trọng lượng <span className="text-red-500">*</span>
                    </label>
                    <Input type="number" step="0.001" min="0.001" required readOnly={!!editingId} error={errors.trongLuong?.message} {...register("trongLuong")} className="rounded-2xl h-12 font-mono font-bold shadow-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-zinc-400" /> Đơn giá nhập (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <Input type="number" min="1000" required readOnly={!!editingId} error={errors.donGiaNhap?.message} {...register("donGiaNhap")} className="rounded-2xl h-12 font-mono font-bold text-primary shadow-sm" />
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
                    {editingId ? `Đang sửa mã ${editingId}: chỉ tên và loại được lưu` : "Hệ thống sẽ tự sinh mã sản phẩm"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl px-10 h-12 font-bold text-zinc-500 border-zinc-200">Hủy</Button>
                  <Button type="submit" disabled={isSubmitting} className="rounded-2xl px-12 h-12 bg-primary text-white font-black shadow-xl shadow-primary/30 hover:translate-y-[-2px] active:translate-y-0 transition-all uppercase tracking-tighter">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? "Lưu thay đổi" : "Xác nhận Nhập kho"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
              <div>
                <h3 className="text-lg font-black text-zinc-900 font-montserrat uppercase">Thêm loại sản phẩm</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Loại mới sẽ được chọn ngay cho sản phẩm đang nhập.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-200 text-zinc-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-8 space-y-5">
              <Input
                label="Tên loại sản phẩm"
                required
                placeholder="Ví dụ: Khúc vàng 9999"
                value={categoryDraft.tenLSP}
                onChange={(event) => setCategoryDraft((prev) => ({ ...prev, tenLSP: event.target.value }))}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Đơn vị tính mặc định <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={categoryDraft.maDVT}
                  onChange={(event) => setCategoryDraft((prev) => ({ ...prev, maDVT: event.target.value }))}
                  className="w-full h-11 px-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-zinc-700"
                >
                  <option value="">-- Chọn đơn vị tính --</option>
                  {units.map((unit) => (
                    <option key={unit.maDVT} value={unit.maDVT}>{unit.tenDVT}</option>
                  ))}
                </select>
              </div>

              <Input
                label="% lợi nhuận"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={categoryDraft.phanTramLoiNhuan}
                onChange={(event) => setCategoryDraft((prev) => ({ ...prev, phanTramLoiNhuan: Number(event.target.value) }))}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreatingCategory} className="rounded-xl">
                  {isCreatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : "Thêm loại"}
                </Button>
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
                  Xác nhận xóa <span className="font-bold text-zinc-800">&quot;{deleteConfirm.name}&quot;</span>?
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
