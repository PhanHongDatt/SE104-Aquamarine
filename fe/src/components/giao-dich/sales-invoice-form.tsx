"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Trash2, Save, Printer, Search, X, Check
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { salesInvoiceSchema, type SalesInvoiceFormValues } from "@/schemas/giao-dich.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { lapPhieuBanHang, updatePhieuBanHang } from "@/actions/giao-dich";
import { calculateLineTotal, calculateSellPrice, canSellQuantity } from "@/lib/business-rules";

interface SalesInvoiceFormProps {
  products: any[];
  customers?: any[];
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

export function SalesInvoiceForm({
  products,
  customers = [],
  nextSoPhieu,
  returnUrl = "/admin/giao-dich/ban-hang",
  mode = "create",
  initialData,
  onSuccess,
}: SalesInvoiceFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit" && initialData;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState(() => {
    const customer = initialData?.khachHang;
    if (customer?.hoTen) {
      return `${customer.hoTen} - ${customer.soDienThoai || ""}`.trim();
    }
    return "";
  });
  const todayInputValue = useMemo(() => toDateInputValue(new Date()), []);
  const initialDateInputValue = useMemo(() => {
    return initialData?.ngayLap ? toDateInputValue(new Date(initialData.ngayLap)) : todayInputValue;
  }, [initialData?.ngayLap, todayInputValue]);
  const productMap = useMemo(() => new Map(products.map((product) => [product.maSP, product])), [products]);
  const initialDetails = useMemo(() => {
    if (!initialData?.chiTietBanHang) return [];

    return initialData.chiTietBanHang.map((item: any) => {
      const product = productMap.get(item.maSP) || item.sanPham || {};
      const oldQty = Number(item.soLuong || 0);
      const donGiaBan = Number(item.donGia ?? item.donGiaBan ?? product.donGiaBan ?? 0);
      const phanTramLN = Number(product.loaiSanPham?.phanTramLoiNhuan || 0);

      return {
        maSP: item.maSP,
        tenSP: product.tenSP || item.sanPham?.tenSP,
        tenLSP: product.loaiSanPham?.tenLSP || item.sanPham?.loaiSanPham?.tenLSP,
        maDVT: product.maDVT || item.sanPham?.maDVT,
        tenDVT: product.donViTinh?.tenDVT || item.sanPham?.donViTinh?.tenDVT,
        soLuong: oldQty,
        donGiaNhap: Number(product.donGiaNhap || item.sanPham?.donGiaNhap || 0),
        phanTramLoiNhuan: phanTramLN,
        donGiaBan,
        thanhTien: Number(item.thanhTien ?? calculateLineTotal(oldQty, donGiaBan)),
        tonKho: Number(product.tonKho ?? item.sanPham?.tonKho ?? 0) + oldQty,
      };
    });
  }, [initialData?.chiTietBanHang, productMap]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalesInvoiceFormValues>({
    resolver: zodResolver(salesInvoiceSchema),
    defaultValues: {
      soPhieu: initialData?.soPhieu || nextSoPhieu,
      ngayLap: initialDateInputValue as any,
      maKH: initialData?.maKH || "",
      tenKhachHang: initialData?.tenKhachHang || initialData?.khachHang?.hoTen || "",
      soDienThoai: initialData?.khachHang?.soDienThoai || "",
      chiTietBanHang: initialDetails,
      tongTien: Number(initialData?.tongTien || 0),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chiTietBanHang",
  });

  const selectedCustomerId = watch("maKH");
  const detailError =
    (errors.chiTietBanHang as any)?.message ||
    (errors.chiTietBanHang as any)?.root?.message;

  // useWatch detect nested field changes (watch() doesn't)
  const watchedItems = useWatch({ control, name: "chiTietBanHang" });
  const items = useMemo(() => watchedItems || [], [watchedItems]);

  // Calculate total automatically
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

  const filteredCustomers = customers
    .filter((customer) => {
      const keyword = customerSearch.trim().toLowerCase();
      if (!keyword) return true;
      return [customer.maKH, customer.hoTen, customer.soDienThoai]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    })
    .slice(0, 6);

  const selectCustomer = (customer: any) => {
    setValue("maKH", customer.maKH);
    setValue("tenKhachHang", customer.hoTen);
    setCustomerSearch(`${customer.hoTen} - ${customer.soDienThoai}`);
  };

  const clearCustomer = () => {
    setValue("maKH", "");
    setValue("tenKhachHang", "");
    setCustomerSearch("");
  };

  const addProduct = (p: any) => {
    // Check if product already in list
    const existing = items.findIndex(item => item.maSP === p.maSP);
    if (existing !== -1) {
      toast.warning("Sản phẩm đã có trong danh sách");
      return;
    }

    const phanTramLN = Number(p.loaiSanPham?.phanTramLoiNhuan || 0);
    const giaBan = calculateSellPrice(Number(p.donGiaNhap), phanTramLN);

    append({
      maSP: p.maSP,
      tenSP: p.tenSP,
      tenLSP: p.loaiSanPham?.tenLSP,
      maDVT: p.maDVT,
      tenDVT: p.donViTinh?.tenDVT,
      soLuong: 1,
      donGiaNhap: Number(p.donGiaNhap),
      phanTramLoiNhuan: phanTramLN,
      donGiaBan: giaBan,
      thanhTien: giaBan, // 1 * giaBan
      tonKho: p.tonKho,
    });
    setIsProductModalOpen(false);
  };

  const updateItemQuantity = (index: number, qty: number) => {
    const item = items[index];
    const nextQty = Math.max(1, Number(qty) || 1);
    if (!canSellQuantity(item.tonKho || 0, nextQty)) {
      toast.error(`Số lượng bán vượt quá tồn kho (${item.tonKho})`);
      return;
    }
    const giaBan = Number(item.donGiaBan);
    const newItems = [...items];
    newItems[index] = {
      ...item,
      soLuong: nextQty,
      thanhTien: calculateLineTotal(nextQty, giaBan),
    };
    setValue("chiTietBanHang", newItems, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = async (data: SalesInvoiceFormValues) => {
    try {
      if (!isEditMode && !data.maKH?.trim() && !data.soDienThoai?.trim()) {
        setError("soDienThoai", {
          type: "manual",
          message: "Vui lòng nhập số điện thoại cho khách hàng mới",
        });
        toast.error("Vui lòng nhập số điện thoại cho khách hàng mới");
        return;
      }
      const res = isEditMode
        ? await updatePhieuBanHang(initialData.soPhieu, data as any)
        : await lapPhieuBanHang(data as any);
      if (res.success) {
        toast.success(res.message);
        router.push(returnUrl);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error("Đã xảy ra lỗi hệ thống khi lưu phiếu");
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: General Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 cursor-default select-none">
              Thông tin chung
            </h2>
            
            <div className="space-y-4">
              <div className="pointer-events-none">
                <Input
                  label="Số phiếu"
                  readOnly
                  tabIndex={-1}
                  className="font-mono text-xs cursor-default"
                  {...register("soPhieu")}
                />
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

              <input type="hidden" {...register("maKH")} />

              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-[38px] w-4 h-4 text-zinc-400" />
                  <Input
                    label="Tìm khách hàng"
                    placeholder="Mã, SĐT hoặc tên khách hàng"
                    className="pl-10 pr-10"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {selectedCustomerId && (
                    <button
                      type="button"
                      onClick={clearCustomer}
                      className="absolute right-3 top-[36px] p-1 text-zinc-400 hover:text-zinc-700"
                      aria-label="Bỏ chọn khách hàng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {customerSearch.trim() && !selectedCustomerId && (
                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-zinc-400">Không tìm thấy khách hàng</div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.maKH}
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                        >
                          <div className="font-semibold text-sm text-zinc-900">{customer.hoTen}</div>
                          <div className="text-xs text-zinc-500 font-mono">{customer.maKH} - {customer.soDienThoai}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Input
                label="Tên khách hàng"
                placeholder="Nhập tên khách hàng nếu chưa có hồ sơ"
                required
                error={errors.tenKhachHang?.message}
                {...register("tenKhachHang")}
              />

              {!selectedCustomerId && (
                <Input
                  label="Số điện thoại"
                  placeholder="Nhập SĐT để lưu hồ sơ khách hàng"
                  required={!isEditMode}
                  error={errors.soDienThoai?.message}
                  {...register("soDienThoai")}
                />
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
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Cập nhật phiếu" : "Lưu & Xuất phiếu"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Products Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 cursor-default select-none">
              Danh sách sản phẩm
            </h2>
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
            <table className="w-full min-w-[860px] text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px]">
                  <th className="px-4 py-4 w-10 text-center">STT</th>
                  <th className="px-4 py-4">Sản phẩm</th>
                  <th className="px-4 py-4">Loại sản phẩm</th>
                  <th className="px-4 py-4 w-24 text-center">Số lượng</th>
                  <th className="px-4 py-4 text-center">Đơn vị tính</th>
                  <th className="px-4 py-4 text-right">Đơn giá</th>
                  <th className="px-4 py-4 text-right">Thành tiền</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-20 text-center text-zinc-400 italic">
                      <div className="flex flex-col items-center gap-2">
                        <span>Chưa có sản phẩm nào được chọn</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-4 text-center text-zinc-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 max-w-[180px] whitespace-normal break-words leading-snug">{items[index]?.tenSP}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] font-mono text-zinc-400 uppercase bg-zinc-100 px-1 rounded">{items[index]?.maSP}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block max-w-[150px] px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-bold border border-zinc-200 whitespace-normal break-words leading-tight">
                          {items[index]?.tenLSP}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          id={`sales-item-quantity-${index}`}
                          name={`salesItemQuantity${index}`}
                          type="number"
                          min="1"
                          value={items[index]?.soLuong}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-full h-9 bg-zinc-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <p className="text-[10px] text-zinc-400 text-center mt-1">Kho: {items[index]?.tonKho}</p>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-zinc-700">
                        {items[index]?.tenDVT}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-zinc-600">
                        {formatCurrency(items[index]?.donGiaBan || 0)}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-zinc-900">
                        {formatCurrency(items[index]?.thanhTien || 0)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Product Selection Modal */}
      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        title="Chọn sản phẩm bán ra"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Tìm theo mã hoặc tên sản phẩm..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredProducts.map(p => {
              const inStock = p.tonKho > 0;
              const alreadyAdded = items.some(i => i.maSP === p.maSP);

              return (
                <button
                  key={p.maSP}
                  type="button"
                  disabled={!inStock || alreadyAdded}
                  onClick={() => addProduct(p)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left
                    ${alreadyAdded ? 'bg-zinc-50 border-zinc-100 opacity-60' : 
                      inStock ? 'bg-white border-zinc-100 hover:border-primary hover:shadow-md' : 'bg-red-50/30 border-red-100 opacity-60'}
                  `}
                >
                  <div className="flex gap-4">
	                      <div>
	                      <p className="font-bold text-zinc-900">{p.tenSP}</p>
	                      <div className="flex items-center gap-2 mt-1">
	                        <span className="text-xs text-zinc-400">{p.maSP}</span>
	                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
	                        <span className="text-xs text-zinc-400">{p.loaiSanPham?.tenLSP}</span>
	                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
	                        <span className={`text-xs font-bold ${inStock ? 'text-zinc-500' : 'text-red-500'}`}>
	                          Tồn: {p.tonKho} {p.donViTinh?.tenDVT}
                        </span>
                      </div>
                    </div>
                  </div>
                  {alreadyAdded ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : !inStock ? (
                    <span className="text-xs text-red-400 font-bold uppercase">Hết hàng</span>
                  ) : (
                    <span className="text-xs text-primary font-bold uppercase group-hover:underline">Chọn</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </form>
  );
}
