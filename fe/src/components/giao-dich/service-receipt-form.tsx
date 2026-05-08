"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Trash2, Save, Search, X, Check, Wrench, Info
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { serviceReceiptSchema, type ServiceReceiptFormValues } from "@/schemas/service.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { lapPhieuDichVu } from "@/actions/service.action";

interface ServiceReceiptFormProps {
  serviceTypes: any[];
  nextSoPhieu: string;
  redirectPath?: string;
  minPrepaymentPercent?: number;
}

export function ServiceReceiptForm({ 
  serviceTypes, 
  nextSoPhieu,
  redirectPath = "/dich-vu/tra-cuu",
  minPrepaymentPercent = 50,
}: ServiceReceiptFormProps) {
  const router = useRouter();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceReceiptFormValues>({
    resolver: zodResolver(serviceReceiptSchema),
    defaultValues: {
      soPhieu: nextSoPhieu,
      ngayLap: new Date(),
      tenKhachHang: "",
      soDienThoai: "",
      chiTietDichVu: [],
      tongTien: 0,
      tongTraTruoc: 0,
      tongConLai: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chiTietDichVu",
  });

  const items = watch("chiTietDichVu");

  // Calculate totals automatically
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.thanhTien || 0), 0);
  }, [items]);

  const totalPrepayment = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.traTruoc || 0), 0);
  }, [items]);

  const totalRemaining = useMemo(() => {
    return totalAmount - totalPrepayment;
  }, [totalAmount, totalPrepayment]);

  useEffect(() => {
    setValue("tongTien", totalAmount);
    setValue("tongTraTruoc", totalPrepayment);
    setValue("tongConLai", totalRemaining);
  }, [totalAmount, totalPrepayment, totalRemaining, setValue]);

  const filteredServices = serviceTypes.filter(s => 
    s.tenDV.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maDV.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addService = (s: any) => {
    // Check if service already in list (optional, maybe customer wants 2 of same service with different costs)
    // For now, let's allow multiple entries of same service type if needed, or just append.
    
    append({
      maDV: s.maDV,
      tenDV: s.tenDV,
      nhomDV: s.nhomDV,
      donGiaDV: Number(s.donGiaDV),
      chiPhiPhatSinh: 0,
      donGiaDuocTinh: Number(s.donGiaDV),
      soLuong: 1,
      thanhTien: Number(s.donGiaDV),
	      traTruoc: Math.round(Number(s.donGiaDV) * (minPrepaymentPercent / 100)),
	      conLai: Number(s.donGiaDV) - Math.round(Number(s.donGiaDV) * (minPrepaymentPercent / 100)),
    });
    setIsServiceModalOpen(false);
  };

  const [globalPrepayPercent, setGlobalPrepayPercent] = useState<number>(minPrepaymentPercent);

  const applyGlobalPrepayment = (percent: number) => {
    setGlobalPrepayPercent(percent);
    // Create a new array to ensure watch() detects the change immediately
    const updatedDetails = items.map((item) => {
      const thanhTien = Number(item.thanhTien || 0);
      const newTraTruoc = Math.round(thanhTien * (percent / 100));
      return {
        ...item,
        traTruoc: newTraTruoc,
        conLai: thanhTien - newTraTruoc
      };
    });
    setValue("chiTietDichVu", updatedDetails);
    toast.info(`Đã áp dụng trả trước ${percent}% cho tất cả dịch vụ`);
  };

  const updateItem = (index: number, updates: Partial<any>) => {
    const currentItem = items[index];
    const item = { ...currentItem, ...updates };
    
    const donGiaDuocTinh = Number(item.donGiaDV) + Number(item.chiPhiPhatSinh || 0);
    const thanhTien = donGiaDuocTinh * (item.soLuong || 1);
    
    setValue(`chiTietDichVu.${index}.donGiaDuocTinh`, donGiaDuocTinh);
    setValue(`chiTietDichVu.${index}.thanhTien`, thanhTien);
    
    let currentTraTruoc = Number(item.traTruoc || 0);
    
    // If it's a new item or major change, apply the current global percentage
    if (updates.hasOwnProperty('maDV') || (updates.soLuong && !updates.hasOwnProperty('traTruoc'))) {
       currentTraTruoc = Math.round(thanhTien * (globalPrepayPercent / 100));
    } else if (updates.hasOwnProperty('traTruoc')) {
       currentTraTruoc = Number(updates.traTruoc || 0);
    }
    
    setValue(`chiTietDichVu.${index}.traTruoc`, currentTraTruoc);
    setValue(`chiTietDichVu.${index}.conLai`, thanhTien - currentTraTruoc);
  };

  const onSubmit = async (data: ServiceReceiptFormValues) => {
    // 1. Check total prepayment vs total amount
    if (data.tongTraTruoc > data.tongTien) {
      toast.error(`Tổng tiền trả trước (${formatCurrency(data.tongTraTruoc)}) không được lớn hơn tổng tiền dịch vụ (${formatCurrency(data.tongTien)})`);
      return;
    }

    // 2. Client-side validation for each item's prepayment (minimum 50%)
    for (let i = 0; i < data.chiTietDichVu.length; i++) {
      const item = data.chiTietDichVu[i];
      if (item.traTruoc < item.thanhTien * (minPrepaymentPercent / 100)) {
        toast.error(`Dịch vụ "${item.tenDV}" yêu cầu trả trước tối thiểu ${minPrepaymentPercent}% (${formatCurrency(item.thanhTien * (minPrepaymentPercent / 100))})`);
        return;
      }
      if (item.traTruoc > item.thanhTien) {
        toast.error(`Tiền trả trước cho "${item.tenDV}" không được lớn hơn thành tiền`);
        return;
      }
    }

    try {
      const res = await lapPhieuDichVu(data);
      if (res.success) {
        toast.success(res.message);
        router.push(redirectPath);
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
              Thông tin khách hàng
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="pointer-events-none">
                  <Input
                    label="Số phiếu"
                    readOnly
                    tabIndex={-1}
                    className="font-mono text-xs cursor-default bg-zinc-50"
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
                    className="cursor-default bg-zinc-50"
                  />
                </div>
              </div>

              <Input
                label="Tên khách hàng"
                placeholder="Nhập tên khách hàng"
                error={errors.tenKhachHang?.message}
                {...register("tenKhachHang")}
              />

              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                error={errors.soDienThoai?.message}
                {...register("soDienThoai")}
              />
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex justify-between items-center">
                  Mức trả trước nhanh
                  <span className="text-primary">{globalPrepayPercent}%</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
	                  {Array.from(new Set([minPrepaymentPercent, 75, 100])).sort((a, b) => a - b).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => applyGlobalPrepayment(p)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        globalPrepayPercent === p 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-primary/50'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-primary/10 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Tổng tiền dịch vụ:</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-zinc-500">Tổng trả trước:</span>
                  <span className={`${totalPrepayment > totalAmount ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                    {totalPrepayment > totalAmount ? '!' : '-'}{formatCurrency(totalPrepayment)}
                  </span>
                </div>
                <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
                  <span className="text-zinc-600 font-bold">Còn lại:</span>
                  <span className={`text-2xl font-black font-montserrat tracking-tight ${totalRemaining < 0 ? 'text-red-500' : 'text-primary'}`}>
                    {formatCurrency(totalRemaining < 0 ? 0 : totalRemaining)}
                  </span>
                </div>
                {totalRemaining < 0 && (
                  <p className="text-[10px] text-red-500 font-bold text-right italic animate-bounce">
                    * Tiền trả trước vượt quá tổng tiền!
                  </p>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                loading={isSubmitting} 
                disabled={totalPrepayment > totalAmount}
                className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20 text-base font-bold disabled:opacity-50 disabled:shadow-none"
              >
                <Save className="w-5 h-5 mr-2" />
                Lưu Phiếu Dịch Vụ
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
	              <strong>Quy định:</strong> Số tiền trả trước của từng loại dịch vụ phải lớn hơn hoặc bằng {minPrepaymentPercent}% thành tiền của loại dịch vụ đó.
            </p>
          </div>
        </div>

        {/* Right: Services Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 cursor-default select-none">
              Danh sách dịch vụ
            </h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsServiceModalOpen(true)}
              className="bg-primary/5 border-primary/30 text-primary hover:bg-primary hover:text-white shadow-sm font-bold"
            >
              + Thêm dịch vụ
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[450px]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[10px]">
                    <th className="px-4 py-4 w-8 text-center">STT</th>
                    <th className="px-4 py-4 min-w-[200px]">Loại dịch vụ</th>
                    <th className="px-4 py-4 text-right">Đơn giá</th>
                    <th className="px-4 py-4 text-right">Phát sinh</th>
                    <th className="px-4 py-4 text-right">Đơn giá được tính</th>
                    <th className="px-4 py-4 w-24 text-center">Số lượng</th>
                    <th className="px-4 py-4 text-right">Thành tiền</th>
                    <th className="px-4 py-4 text-right">Trả trước</th>
                    <th className="px-4 py-4 text-right">Còn lại</th>
                    <th className="px-4 py-4 text-center">Ngày giao</th>
                    <th className="px-4 py-4 text-center">Tình trạng</th>
                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-24 text-center text-zinc-400 italic">
                        <div className="flex flex-col items-center gap-2">
                          <Wrench className="w-8 h-8 text-zinc-200" />
                          <span>Chưa có dịch vụ nào được chọn</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => (
                      <tr key={field.id} className="group hover:bg-zinc-50/50 transition-colors">
                        <td className="px-2 py-4 text-center text-zinc-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 line-clamp-1">{items[index]?.tenDV}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                                 items[index]?.nhomDV === 'GiaCong' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                               }`}>
                                 {items[index]?.nhomDV === 'GiaCong' ? 'Gia công' : 'Kiểm định'}
                               </span>
                               <span className="text-[10px] font-mono text-zinc-400 uppercase">{items[index]?.maDV}</span>
                            </div>
                            {items[index]?.nhomDV === 'KiemDinh' && (
                              <p className="text-[10px] text-amber-600 mt-1 font-medium italic">
                                * Yêu cầu ghi kết quả khi giao
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-right font-medium text-zinc-600">
                          {formatCurrency(items[index]?.donGiaDV || 0)}
                        </td>
                        <td className="px-2 py-4">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={items[index]?.chiPhiPhatSinh}
                            onChange={(e) => updateItem(index, { chiPhiPhatSinh: parseInt(e.target.value) || 0 })}
                            className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-right px-2 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </td>
                        <td className="px-2 py-4 text-right font-bold text-primary">
                          {formatCurrency(items[index]?.donGiaDuocTinh || 0)}
                        </td>
                        <td className="px-2 py-4">
                          <input
                            type="number"
                            min="1"
                            value={items[index]?.soLuong}
                            onChange={(e) => updateItem(index, { soLuong: parseInt(e.target.value) || 0 })}
                            className="w-full h-9 bg-zinc-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </td>
                        <td className="px-2 py-4 text-right font-bold text-zinc-900">
                          {formatCurrency(items[index]?.thanhTien || 0)}
                        </td>
                        <td className="px-2 py-4">
                          <div className="space-y-1">
                            <input
                              type="number"
                              step="1000"
                              value={items[index]?.traTruoc}
                              onChange={(e) => updateItem(index, { traTruoc: Number(e.target.value) || 0 })}
                              className={`w-full h-9 rounded-lg text-right px-2 font-bold focus:ring-2 transition-all ${
	                                (items[index]?.traTruoc || 0) < (items[index]?.thanhTien || 0) * (minPrepaymentPercent / 100)
                                ? 'bg-red-50 border-red-200 text-red-600 focus:ring-red-200' 
                                : 'bg-green-50 border-green-200 text-green-700 focus:ring-green-200'
                              }`}
                            />
                            <p className="text-[9px] text-zinc-400 text-right">
	                              Min: {formatCurrency((items[index]?.thanhTien || 0) * (minPrepaymentPercent / 100))}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-right font-bold text-zinc-700">
                          {formatCurrency(items[index]?.conLai || 0)}
                        </td>
                        <td className="px-2 py-4 text-center text-zinc-400 text-xs">---</td>
                        <td className="px-2 py-4 text-center">
                          <span className="inline-flex px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase">
                            Chưa giao
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
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
      </div>

      {/* Service Selection Modal */}
      <Modal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        title="Chọn loại dịch vụ"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Tìm theo mã hoặc tên dịch vụ..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filteredServices.map(s => {
              return (
                <button
                  key={s.maDV}
                  type="button"
                  onClick={() => addService(s)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-white hover:border-primary hover:shadow-md transition-all text-left group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-zinc-900">{s.tenDV}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        s.nhomDV === 'GiaCong' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {s.nhomDV === 'GiaCong' ? 'Gia công' : 'Kiểm định'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-400">{s.maDV}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-200" />
                      <span className="text-xs font-bold text-primary">
                        Đơn giá: {formatCurrency(Number(s.donGiaDV))}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-bold uppercase group-hover:underline">Chọn</span>
                </button>
              );
            })}
            {filteredServices.length === 0 && (
              <div className="py-10 text-center text-zinc-400 italic">
                Không tìm thấy dịch vụ nào
              </div>
            )}
          </div>
        </div>
      </Modal>
    </form>
  );
}
