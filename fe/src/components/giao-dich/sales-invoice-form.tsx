"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { lapPhieuBanHang } from "@/actions/giao-dich";

interface SalesInvoiceFormProps {
  products: any[];
  nextSoPhieu: string;
}

export function SalesInvoiceForm({ products, nextSoPhieu }: SalesInvoiceFormProps) {
  const router = useRouter();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalesInvoiceFormValues>({
    resolver: zodResolver(salesInvoiceSchema),
    defaultValues: {
      soPhieu: nextSoPhieu,
      ngayLap: new Date(),
      tenKhachHang: "",
      chiTietBanHang: [],
      tongTien: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chiTietBanHang",
  });

  const items = watch("chiTietBanHang");

  // Calculate total automatically
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.thanhTien || 0), 0);
  }, [items]);

  useEffect(() => {
    setValue("tongTien", totalAmount);
  }, [totalAmount, setValue]);

  const filteredProducts = products.filter(p => 
    p.tenSP.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.maSP.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (p: any) => {
    // Check if product already in list
    const existing = items.findIndex(item => item.maSP === p.maSP);
    if (existing !== -1) {
      toast.warning("Sản phẩm đã có trong danh sách");
      return;
    }

    const phanTramLN = Number(p.loaiSanPham?.phanTramLoiNhuan || 0);
    const giaBan = Number(p.donGiaNhap) * (1 + phanTramLN / 100);

    append({
      maSP: p.maSP,
      tenSP: p.tenSP,
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
    if (qty > (item.tonKho || 0)) {
      toast.error(`Số lượng bán vượt quá tồn kho (${item.tonKho})`);
      return;
    }
    const giaBan = Number(item.donGiaBan);
    setValue(`chiTietBanHang.${index}.soLuong`, qty);
    setValue(`chiTietBanHang.${index}.thanhTien`, qty * giaBan);
  };

  const onSubmit = async (data: SalesInvoiceFormValues) => {
    try {
      const res = await lapPhieuBanHang(data as any);
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/giao-dich/ban-hang");
        router.refresh();
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

              <div className="pointer-events-none">
                <Input
                  label="Ngày lập"
                  type="date"
                  readOnly
                  tabIndex={-1}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="cursor-default"
                />
              </div>

              <Input
                label="Khách hàng"
                placeholder="Nhập tên khách hàng"
                error={errors.tenKhachHang?.message}
                {...register("tenKhachHang")}
              />
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
                Lưu & Xuất phiếu
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

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px]">
                  <th className="px-4 py-4 w-10 text-center">#</th>
                  <th className="px-4 py-4">Sản phẩm</th>
                  <th className="px-4 py-4 w-24 text-center">Số lượng</th>
                  <th className="px-4 py-4 text-right">Đơn giá</th>
                  <th className="px-4 py-4 text-right">Thành tiền</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-20 text-center text-zinc-400 italic">
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
                          <span className="font-bold text-zinc-900 line-clamp-1">{items[index]?.tenSP}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] font-mono text-zinc-400 uppercase bg-zinc-100 px-1 rounded">{items[index]?.maSP}</span>
                             <span className="text-[10px] text-zinc-400 font-medium">DVT: {items[index]?.tenDVT}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="1"
                          value={items[index]?.soLuong}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-full h-9 bg-zinc-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <p className="text-[10px] text-zinc-400 text-center mt-1">Kho: {items[index]?.tonKho}</p>
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
