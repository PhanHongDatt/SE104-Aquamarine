"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Trash2, Save, Search, X, Check, Wrench, Info, Minus, Plus
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { serviceReceiptSchema, type ServiceReceiptFormValues } from "@/schemas/service.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { lapPhieuDichVu, updatePhieuDichVu } from "@/actions/service.action";

interface ServiceReceiptFormProps {
  serviceTypes: any[];
  customers?: any[];
  nextSoPhieu: string;
  redirectPath?: string;
  minPrepaymentPercent?: number;
  mode?: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
}

/**
 * Input số: type="text" + inputMode="numeric" → nhập tự do, không spinner.
 * Commit liên tục để tổng tiền và trả trước cập nhật ngay khi nhập.
 */
function InlineNumberInput({
  value,
  onCommit,
  min = 0,
  id,
  name,
  className,
}: {
  value: number;
  onCommit: (val: number) => void;
  min?: number;
  id: string;
  name: string;
  className?: string;
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value ?? min));
  }, [value, min]);

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      value={local}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setLocal(raw);
        if (raw !== "") {
          const num = Number(raw);
          onCommit(Number.isFinite(num) ? Math.max(min, num) : min);
        }
      }}
      onBlur={() => {
        const num = Number(local);
        const final = Number.isNaN(num) || num < min ? min : num;
        setLocal(String(final));
        onCommit(final);
      }}
      className={className}
    />
  );
}

function toDateInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function ServiceReceiptForm({
  serviceTypes,
  customers = [],
  nextSoPhieu,
  redirectPath = "/dich-vu/tra-cuu",
  minPrepaymentPercent = 50,
  mode = "create",
  initialData,
  onSuccess,
}: ServiceReceiptFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit" && initialData;
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState(() => {
    const customer = initialData?.khachHang;
    if (customer?.hoTen) {
      return `${customer.hoTen} - ${customer.soDienThoai || ""}`.trim();
    }
    return "";
  });
  const [globalPrepayPercent, setGlobalPrepayPercent] = useState<number | null>(minPrepaymentPercent);
  const [customPrepayPercent, setCustomPrepayPercent] = useState(String(minPrepaymentPercent));
  const todayInputValue = useMemo(() => toDateInputValue(new Date()), []);
  const initialDateInputValue = useMemo(() => {
    return initialData?.ngayLap ? toDateInputValue(new Date(initialData.ngayLap)) : todayInputValue;
  }, [initialData?.ngayLap, todayInputValue]);
  const serviceMap = useMemo(() => new Map(serviceTypes.map((service) => [service.maDV, service])), [serviceTypes]);
  const initialDetails = useMemo(() => {
    if (!initialData?.chiTietDichVu) return [];

    return initialData.chiTietDichVu.map((item: any) => {
      const service = serviceMap.get(item.maDV) || item.loaiDichVu || {};
      return {
        maDV: item.maDV,
        tenDV: service.tenDV || item.loaiDichVu?.tenDV,
        nhomDV: service.nhomDV || item.loaiDichVu?.nhomDV,
        donGiaDV: Number(item.donGiaDV ?? service.donGiaDV ?? 0),
        chiPhiPhatSinh: Number(item.chiPhiPhatSinh || 0),
        donGiaDuocTinh: Number(item.donGiaDuocTinh || 0),
        soLuong: Number(item.soLuong || 1),
        thanhTien: Number(item.thanhTien || 0),
        traTruoc: Number(item.traTruoc || 0),
        conLai: Number(item.conLai || 0),
      };
    });
  }, [initialData?.chiTietDichVu, serviceMap]);

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
      soPhieu: initialData?.soPhieu || nextSoPhieu,
      ngayLap: initialDateInputValue as any,
      maKH: initialData?.maKH || "",
      tenKhachHang: initialData?.tenKhachHang || initialData?.khachHang?.hoTen || "",
      soDienThoai: initialData?.soDienThoai || initialData?.khachHang?.soDienThoai || "",
      chiTietDichVu: initialDetails,
      tongTien: Number(initialData?.tongTien || 0),
      tongTraTruoc: Number(initialData?.tongTraTruoc || 0),
      tongConLai: Number(initialData?.tongConLai || 0),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chiTietDichVu",
  });

  // useWatch detect nested field changes (watch() doesn't)
  const watchedItems = useWatch({ control, name: "chiTietDichVu" });
  const items = useMemo(() => watchedItems || [], [watchedItems]);
  const selectedCustomerId = watch("maKH");
  const detailError =
    (errors.chiTietDichVu as any)?.message ||
    (errors.chiTietDichVu as any)?.root?.message;

  // Customer search
  const filteredCustomers = customers
    .filter((c) => {
      const kw = customerSearch.trim().toLowerCase();
      if (!kw) return true;
      return [c.maKH, c.hoTen, c.soDienThoai].filter(Boolean).some((v) => String(v).toLowerCase().includes(kw));
    })
    .slice(0, 6);

  const selectCustomer = (customer: any) => {
    setValue("maKH", customer.maKH);
    setValue("tenKhachHang", customer.hoTen);
    setValue("soDienThoai", customer.soDienThoai || "");
    setCustomerSearch(`${customer.hoTen} - ${customer.soDienThoai}`);
  };

  const clearCustomer = () => {
    setValue("maKH", "");
    setValue("tenKhachHang", "");
    setValue("soDienThoai", "");
    setCustomerSearch("");
  };

  // Calculate totals automatically
  const totalAmount = useMemo(() => {
    return items.reduce((sum: number, item: any) => sum + (item.thanhTien || 0), 0);
  }, [items]);

  const totalPrepayment = useMemo(() => {
    return items.reduce((sum: number, item: any) => sum + (item.traTruoc || 0), 0);
  }, [items]);

  const totalRemaining = useMemo(() => {
    return totalAmount - totalPrepayment;
  }, [totalAmount, totalPrepayment]);

  useEffect(() => {
    setValue("tongTien", totalAmount, { shouldDirty: true });
    setValue("tongTraTruoc", totalPrepayment, { shouldDirty: true });
    setValue("tongConLai", totalRemaining, { shouldDirty: true });
  }, [totalAmount, totalPrepayment, totalRemaining, setValue]);

  const filteredServices = serviceTypes.filter(s =>
    s.tenDV.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maDV.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addService = (s: any) => {
    // Check if service already in list (optional, maybe customer wants 2 of same service with different costs)
    // For now, let's allow multiple entries of same service type if needed, or just append.
    
    const donGiaDV = Number(s.donGiaDV);
    // Đơn giá được tính = Đơn giá DV + 0 (QĐ6)
    const donGiaDuocTinh = donGiaDV; // chiPhiPhatSinh = 0
    // Thành tiền = Số lượng × Đơn giá được tính (QĐ6)
    const thanhTien = donGiaDuocTinh * 1; // soLuong = 1
    const prepayPercent = Math.max(globalPrepayPercent ?? minPrepaymentPercent, minPrepaymentPercent);
    const traTruoc = Math.round(thanhTien * (prepayPercent / 100));
    append({
      maDV: s.maDV,
      tenDV: s.tenDV,
      nhomDV: s.nhomDV,
      donGiaDV,
      chiPhiPhatSinh: 0,
      donGiaDuocTinh,
      soLuong: 1,
      thanhTien,
      traTruoc,
      conLai: thanhTien - traTruoc,
    });
    setIsServiceModalOpen(false);
  };

  const applyGlobalPrepayment = (percent: number) => {
    if (!Number.isFinite(percent) || percent < minPrepaymentPercent || percent > 100) {
      toast.error(`Mốc trả trước phải từ ${minPrepaymentPercent}% đến 100%`);
      return;
    }
    if (globalPrepayPercent === percent) {
      setGlobalPrepayPercent(null);
      toast.info("Đã bỏ chọn mốc trả trước nhanh. Bạn có thể nhập trả trước thủ công cho từng dòng.");
      return;
    }
    setGlobalPrepayPercent(percent);
    const updatedDetails = items.map((item: any) => {
      const thanhTien = Number(item.thanhTien || 0);
      const newTraTruoc = Math.round(thanhTien * (percent / 100));
      return {
        ...item,
        traTruoc: newTraTruoc,
        conLai: thanhTien - newTraTruoc
      };
    });
    setValue("chiTietDichVu", updatedDetails, { shouldDirty: true });
    toast.info(`Đã áp dụng trả trước ${percent}% cho tất cả dịch vụ`);
  };

  const applyCustomPrepayment = () => {
    const percent = Number(customPrepayPercent.replace(",", "."));
    applyGlobalPrepayment(percent);
  };

  const updateItem = (index: number, updates: Partial<any>) => {
    const currentItem = items[index];
    const item = { ...currentItem, ...updates };

    // Đơn giá được tính = Đơn giá DV + Chi phí phát sinh (QĐ6)
    const donGiaDuocTinh = Number(item.donGiaDV) + Number(item.chiPhiPhatSinh || 0);
    // Thành tiền = Số lượng × Đơn giá được tính (QĐ6)
    const soLuong = Number(item.soLuong || 1);
    const thanhTien = donGiaDuocTinh * soLuong;
    const amountChanged = ["maDV", "donGiaDV", "chiPhiPhatSinh", "soLuong"].some((field) =>
      Object.prototype.hasOwnProperty.call(updates, field)
    );
    const minTraTruoc = Math.round(thanhTien * (minPrepaymentPercent / 100));
    const activePrepayPercent =
      globalPrepayPercent === null ? null : Math.max(globalPrepayPercent, minPrepaymentPercent);
    const currentTraTruoc = amountChanged
      ? activePrepayPercent === null
        ? Math.min(Math.max(Number(item.traTruoc || 0), minTraTruoc), thanhTien)
        : Math.round(thanhTien * (activePrepayPercent / 100))
      : Math.min(Number(item.traTruoc || 0), thanhTien);

    // Set toàn bộ array để useWatch detect thay đổi
    const newItems = [...items];
    newItems[index] = {
      ...item,
      soLuong,
      donGiaDuocTinh,
      thanhTien,
      traTruoc: currentTraTruoc,
      conLai: thanhTien - currentTraTruoc,
    };
    setValue("chiTietDichVu", newItems, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = async (data: ServiceReceiptFormValues) => {
    // 1. Check total prepayment vs total amount
    if (data.tongTraTruoc > data.tongTien) {
      toast.error(`Tổng tiền trả trước (${formatCurrency(data.tongTraTruoc)}) không được lớn hơn tổng tiền dịch vụ (${formatCurrency(data.tongTien)})`);
      return;
    }

    // 2. Client-side validation: trả trước từ minPrepaymentPercent% đến 100% thành tiền
    for (let i = 0; i < data.chiTietDichVu.length; i++) {
      const item = data.chiTietDichVu[i];
      const minTraTruoc = Math.round(item.thanhTien * (minPrepaymentPercent / 100));
      if (item.traTruoc < minTraTruoc) {
        toast.error(`"${item.tenDV}": trả trước tối thiểu ${formatCurrency(minTraTruoc)} (${minPrepaymentPercent}% × ${formatCurrency(item.thanhTien)})`);
        return;
      }
      if (item.traTruoc > item.thanhTien) {
        toast.error(`"${item.tenDV}": trả trước tối đa ${formatCurrency(item.thanhTien)} (100% thành tiền)`);
        return;
      }
    }

    try {
      const res = isEditMode
        ? await updatePhieuDichVu(initialData.soPhieu, data)
        : await lapPhieuDichVu(data);
      if (res.success) {
        toast.success(res.message);
        router.push(redirectPath);
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
                placeholder="Nhập tên khách hàng"
                required
                error={errors.tenKhachHang?.message}
                {...register("tenKhachHang")}
              />

              <Input
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                required
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
                  <span className="text-primary">{globalPrepayPercent === null ? "Tùy chỉnh" : `${globalPrepayPercent}%`}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
	                  {Array.from(new Set([minPrepaymentPercent, 75, 100]))
                      .filter((p) => p >= minPrepaymentPercent && p <= 100)
                      .sort((a, b) => a - b)
                      .map((p) => (
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
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={minPrepaymentPercent}
                    max={100}
                    step="0.01"
                    value={customPrepayPercent}
                    onChange={(event) => setCustomPrepayPercent(event.target.value)}
                    placeholder="Mốc tùy chọn"
                    className="h-9 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={applyCustomPrepayment}
                    className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Mốc tùy chọn phải từ {minPrepaymentPercent}% đến 100%.
                </p>
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
                {isEditMode ? "Cập nhật phiếu dịch vụ" : "Lưu Phiếu Dịch Vụ"}
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
                    <th className="px-4 py-4 text-right">Đơn giá dịch vụ</th>
                    <th className="px-4 py-4 text-right">Phát sinh</th>
                    <th className="px-4 py-4 text-right">Đơn giá sau phát sinh</th>
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
                          <InlineNumberInput
                            id={`service-item-extra-cost-${index}`}
                            name={`serviceItemExtraCost${index}`}
                            value={items[index]?.chiPhiPhatSinh ?? 0}
                            min={0}

                            onCommit={(val) => updateItem(index, { chiPhiPhatSinh: val })}
                            className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-right px-2 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </td>
                        <td className="px-2 py-4 text-right font-bold text-primary">
                          {formatCurrency(items[index]?.donGiaDuocTinh || 0)}
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const cur = items[index]?.soLuong ?? 1;
                                if (cur > 1) updateItem(index, { soLuong: cur - 1 });
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={(items[index]?.soLuong ?? 1) <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <InlineNumberInput
                              id={`service-item-quantity-${index}`}
                              name={`serviceItemQuantity${index}`}
                              value={items[index]?.soLuong ?? 1}
                              min={1}
                              onCommit={(val) => updateItem(index, { soLuong: val })}
                              className="w-14 h-9 bg-zinc-100 border-none rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const cur = items[index]?.soLuong ?? 1;
                                updateItem(index, { soLuong: cur + 1 });
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-right font-bold text-zinc-900">
                          {formatCurrency(items[index]?.thanhTien || 0)}
                        </td>
                        <td className="px-2 py-4">
                          <div className="space-y-1">
                            <InlineNumberInput
                              id={`service-item-prepayment-${index}`}
                              name={`serviceItemPrepayment${index}`}
                              value={items[index]?.traTruoc ?? 0}
                              min={0}
  
                              onCommit={(val) => updateItem(index, { traTruoc: val })}
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
          {detailError && (
            <p className="text-sm font-medium text-red-600">{detailError}</p>
          )}
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
                        Đơn giá dịch vụ: {formatCurrency(Number(s.donGiaDV))}
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
