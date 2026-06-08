"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Trash2, Save, Search, X, Check, ShoppingBag, Plus
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { purchaseInvoiceSchema, type PurchaseInvoiceFormValues } from "@/schemas/purchase.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { lapPhieuMuaHang, updatePhieuMuaHang } from "@/actions/giao-dich";

interface PurchaseInvoiceFormProps {
  products: any[];
  suppliers: any[];
  nextSoPhieu: string;
  returnUrl?: string;
  mode?: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
}

function toDateInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function PurchaseInvoiceForm({
  products,
  suppliers,
  nextSoPhieu,
  returnUrl,
  mode = "create",
  initialData,
  onSuccess,
}: PurchaseInvoiceFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = mode === "edit" && initialData;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const todayInputValue = useMemo(() => toDateInputValue(new Date()), []);
  const initialDateInputValue = useMemo(() => {
    return initialData?.ngayLap ? toDateInputValue(new Date(initialData.ngayLap)) : todayInputValue;
  }, [initialData?.ngayLap, todayInputValue]);
  const productMap = useMemo(() => new Map(products.map((product) => [product.maSP, product])), [products]);
  const initialDetails = useMemo(() => {
    if (!initialData?.chiTietMuaHang) return [];

    return initialData.chiTietMuaHang.map((item: any) => {
      const product = productMap.get(item.maSP) || item.sanPham || {};
      const soLuong = Number(item.soLuong || 1);
      const donGiaMua = Number(item.donGia ?? item.donGiaMua ?? product.donGiaNhap ?? 0);

      return {
        maSP: item.maSP,
        tenSP: product.tenSP || item.sanPham?.tenSP,
        tenLSP: product.loaiSanPham?.tenLSP || item.sanPham?.loaiSanPham?.tenLSP,
        maDVT: product.maDVT || item.sanPham?.maDVT,
        tenDVT: product.donViTinh?.tenDVT || item.sanPham?.donViTinh?.tenDVT,
        soLuong,
        donGiaMua,
        thanhTien: Number(item.thanhTien ?? soLuong * donGiaMua),
      };
    });
  }, [initialData?.chiTietMuaHang, productMap]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseInvoiceFormValues>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      soPhieu: initialData?.soPhieu || nextSoPhieu,
      ngayLap: initialDateInputValue as any,
      maNCC: initialData?.maNCC || "",
      chiTietMuaHang: initialDetails,
      tongTien: Number(initialData?.tongTien || 0),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chiTietMuaHang",
  });

  const selectedSupplierId = watch("maNCC");
  const selectedSupplier = suppliers.find((supplier) => supplier.maNCC === selectedSupplierId);
  const detailError =
    (errors.chiTietMuaHang as any)?.message ||
    (errors.chiTietMuaHang as any)?.root?.message;

  // useWatch detect nested field changes (watch() doesn't)
  const watchedItems = useWatch({ control, name: "chiTietMuaHang" });
  const items = useMemo(() => watchedItems || [], [watchedItems]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum: number, item: any) => sum + (item.thanhTien || 0), 0);
  }, [items]);

  useEffect(() => {
    setValue("tongTien", totalAmount);
  }, [totalAmount, setValue]);

  const filteredProducts = products.filter(p => 
    p.tenSP.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.maSP.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (p: any) => {
    const existing = items.findIndex(item => item.maSP === p.maSP);
    if (existing !== -1) {
      toast.warning("Sản phẩm đã có trong danh sách");
      return;
    }

    append({
      maSP: p.maSP,
      tenSP: p.tenSP,
      tenLSP: p.loaiSanPham?.tenLSP,
      maDVT: p.maDVT,
      tenDVT: p.donViTinh?.tenDVT,
      soLuong: 1,
      donGiaMua: Number(p.donGiaNhap) || 0,
      thanhTien: Number(p.donGiaNhap) || 0,
    });
    setIsProductModalOpen(false);
  };

  const updateItem = (index: number, qty: number, price: number) => {
    const item = items[index];
    const nextQty = Math.max(1, Number(qty) || 1);
    const nextPrice = Math.max(1, Number(price) || 1);
    const newItems = [...items];
    newItems[index] = {
      ...item,
      soLuong: nextQty,
      donGiaMua: nextPrice,
      thanhTien: nextQty * nextPrice,
    };
    setValue("chiTietMuaHang", newItems, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = async (values: PurchaseInvoiceFormValues) => {
    try {
      const res = isEditMode
        ? await updatePhieuMuaHang(initialData.soPhieu, values as any)
        : await lapPhieuMuaHang(values as any);
      if (res.success) {
        toast.success(res.message);
        router.push(returnUrl || (pathname.startsWith("/nhan-vien") ? "/nhan-vien/giao-dich/mua-hang" : "/admin/giao-dich/mua-hang"));
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi lưu phiếu");
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 cursor-default select-none">Thông tin chung</h2>
            <div className="space-y-4">
              <div>
                <Input label="Số phiếu" readOnly tabIndex={-1} className="font-mono text-xs cursor-default" {...register("soPhieu")} />
              </div>
              <div>
                <Input
                  label="Ngày lập"
                  type="date"
                  required
                  defaultValue={initialDateInputValue}
                  error={errors.ngayLap?.message}
                  {...register("ngayLap", {
                    setValueAs: (value) => value ? new Date(`${value}T00:00:00`) : new Date(),
                  })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 cursor-default select-none">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("maNCC")}
                  required
                  className="w-full rounded-xl border border-soft/60 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-soft/40"
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map(s => (
                    <option key={s.maNCC} value={s.maNCC}>{s.tenNCC}</option>
                  ))}
                </select>
                {errors.maNCC && <p className="text-xs text-red-500">{errors.maNCC.message}</p>}
              </div>
              {selectedSupplier && (
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 space-y-1 text-sm">
                  <p className="font-bold text-zinc-900">{selectedSupplier.tenNCC}</p>
                  <p className="text-zinc-500">Địa chỉ: {selectedSupplier.diaChi}</p>
                  <p className="text-zinc-500">Số điện thoại: {selectedSupplier.soDienThoai}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-6 space-y-4">
            <div className="flex items-center justify-between cursor-default select-none">
              <span className="text-zinc-500 font-medium">Tổng tiền thanh toán</span>
            </div>
            <div className="text-3xl font-black text-primary font-montserrat tracking-tight cursor-default select-none">
              {formatCurrency(totalAmount)}
            </div>
            <div className="pt-2">
              <Button type="submit" loading={isSubmitting} className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20">
                <Save className="w-4 h-4 mr-2" /> {isEditMode ? "Cập nhật phiếu" : "Lưu & Xuất phiếu"}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 cursor-default select-none">Danh sách sản phẩm</h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsProductModalOpen(true)}
              className="bg-primary/5 border-primary/30 text-primary hover:bg-primary hover:text-white shadow-sm font-bold"
            >
              Thêm sản phẩm
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto min-h-[400px]">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px] cursor-default select-none">
                  <th className="px-4 py-4 w-10 text-center">STT</th>
                  <th className="px-4 py-4">Sản phẩm</th>
                  <th className="px-4 py-4">Loại sản phẩm</th>
                  <th className="px-4 py-4 w-24 text-center">Số lượng</th>
                  <th className="px-4 py-4 text-center">Đơn vị tính</th>
                  <th className="px-4 py-4 text-right">Đơn giá mua</th>
                  <th className="px-4 py-4 text-right">Thành tiền</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-20 text-center text-zinc-400 italic">Chưa có sản phẩm nào được chọn</td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-4 text-center text-zinc-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 max-w-[180px] whitespace-normal break-words leading-snug">{items[index]?.tenSP}</span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">{items[index]?.maSP}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block max-w-[150px] px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-bold border border-zinc-200 whitespace-normal break-words leading-tight">
                          {items[index]?.tenLSP}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          id={`purchase-item-quantity-${index}`}
                          name={`purchaseItemQuantity${index}`}
                          type="number"
                          min={1}
                          value={items[index]?.soLuong}
                          onChange={(e) => updateItem(index, parseInt(e.target.value) || 0, items[index]?.donGiaMua)}
                          className="w-full h-9 bg-zinc-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-zinc-700">
                        {items[index]?.tenDVT}
                      </td>
                      <td className="px-4 py-4">
                        <input
                          id={`purchase-item-price-${index}`}
                          name={`purchaseItemPrice${index}`}
                          type="number"
                          min="1"
                          value={items[index]?.donGiaMua}
                          onChange={(e) => updateItem(index, items[index]?.soLuong, parseInt(e.target.value) || 0)}
                          className="w-full h-9 bg-zinc-100 border-none rounded-lg text-right px-2 font-bold focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-4 py-4 text-right font-black text-zinc-900">{formatCurrency(items[index]?.thanhTien || 0)}</td>
                      <td className="px-4 py-4 text-center">
                        <button type="button" onClick={() => remove(index)} className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {detailError && (
            <p className="text-sm font-medium text-red-600">{detailError}</p>
          )}
        </div>
      </div>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Chọn sản phẩm mua vào">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input placeholder="Tìm theo mã hoặc tên sản phẩm..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredProducts.map(p => {
              const alreadyAdded = items.some(i => i.maSP === p.maSP);
              return (
                <button
                  key={p.maSP}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => addProduct(p)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${alreadyAdded ? 'bg-zinc-50 border-zinc-100 opacity-60' : 'bg-white border-zinc-100 hover:border-primary hover:shadow-md'}`}
                >
                  <div className="flex gap-4">
                    <div>
                      <p className="font-bold text-zinc-900">{p.tenSP}</p>
                      <div className="flex items-center gap-2 mt-1">
	                        <span className="text-xs text-zinc-400">{p.maSP}</span>
	                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
	                        <span className="text-xs text-zinc-400">{p.loaiSanPham?.tenLSP}</span>
	                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
	                        <span className="text-xs text-zinc-400">{p.donViTinh?.tenDVT}</span>
	                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
	                        <span className="text-xs text-zinc-500">Đơn giá nhập cũ: {formatCurrency(Number(p.donGiaNhap))}</span>
                      </div>
                    </div>
                  </div>
                  {alreadyAdded ? <Check className="w-5 h-5 text-green-500" /> : <span className="text-xs text-primary font-bold uppercase group-hover:underline">Chọn</span>}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </form>
  );
}
