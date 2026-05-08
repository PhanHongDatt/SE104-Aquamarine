"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Edit2, Loader2, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import {
  createKhachHang,
  deleteKhachHang,
  getKhachHangs,
  updateKhachHang,
} from "@/actions/khach-hang.action";
import {
  HANG_KHACH_HANG_ENUM,
  khachHangSchema,
  type KhachHangInput,
} from "@/schemas/khach-hang.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Customer = {
  maKH: string;
  hoTen: string;
  soDienThoai: string;
  email?: string | null;
  diaChi?: string | null;
  ngaySinh?: string | null;
  hangThanhVien: "Thuong" | "Bac" | "Vang" | "KimCuong";
  ghiChu?: string | null;
  createdAt: string;
};

const membershipLabels: Record<Customer["hangThanhVien"], string> = {
  Thuong: "Thường",
  Bac: "Bạc",
  Vang: "Vàng",
  KimCuong: "Kim cương",
};

const membershipStyles: Record<Customer["hangThanhVien"], string> = {
  Thuong: "bg-zinc-100 text-zinc-600 border-zinc-200",
  Bac: "bg-slate-100 text-slate-700 border-slate-200",
  Vang: "bg-amber-100 text-amber-700 border-amber-200",
  KimCuong: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function CustomerClient({ readonly = false }: { readonly?: boolean }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "QUAN_LY";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KhachHangInput>({
    resolver: zodResolver(khachHangSchema),
    defaultValues: { hangThanhVien: "Thuong" },
  });

  const filteredCustomers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter((customer) =>
      [customer.maKH, customer.hoTen, customer.soDienThoai, customer.email, customer.diaChi]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [customers, searchTerm]);

  async function loadCustomers() {
    setLoading(true);
    const result = await getKhachHangs();
    if (result.success) {
      setCustomers(result.data);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    reset({ hangThanhVien: "Thuong" });
    setIsModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setEditingId(customer.maKH);
    setValue("hoTen", customer.hoTen);
    setValue("soDienThoai", customer.soDienThoai);
    setValue("email", customer.email || "");
    setValue("diaChi", customer.diaChi || "");
    setValue("ngaySinh", toDateInputValue(customer.ngaySinh));
    setValue("hangThanhVien", customer.hangThanhVien);
    setValue("ghiChu", customer.ghiChu || "");
    setIsModalOpen(true);
  }

  async function onSubmit(values: KhachHangInput) {
    const result = editingId
      ? await updateKhachHang(editingId, values)
      : await createKhachHang(values);

    if (result.success) {
      toast.success(result.message);
      setIsModalOpen(false);
      reset({ hangThanhVien: "Thuong" });
      await loadCustomers();
      return;
    }

    toast.error(result.message);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    const result = await deleteKhachHang(deleteConfirm.id);
    if (result.success) {
      toast.success(result.message);
      setDeleteConfirm(null);
      await loadCustomers();
      return;
    }
    toast.error(result.message);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-zinc-900">
            <UserRound className="h-6 w-6 text-primary" />
            Quản lý khách hàng
          </h1>
          <p className="text-sm text-zinc-500">
            Lưu thông tin khách mua trang sức, hỗ trợ tra cứu khi bán hàng, bảo hành và chăm sóc khách hàng.
          </p>
        </div>
        {!readonly && (
          <Button onClick={openCreateModal} className="h-11 rounded-xl px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Thêm khách hàng
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Tổng khách hàng</p>
          <p className="mt-2 text-3xl font-black text-primary">{customers.length}</p>
        </div>
        {HANG_KHACH_HANG_ENUM.slice(1).map((level) => (
          <div key={level} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Hạng {membershipLabels[level]}</p>
            <p className="mt-2 text-3xl font-black text-zinc-900">
              {customers.filter((customer) => customer.hangThanhVien === level).length}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-zinc-900">Danh sách khách hàng</h2>
            <p className="text-xs text-zinc-400">Tìm theo mã, tên, số điện thoại, email hoặc địa chỉ.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm khách hàng..."
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 p-16 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải dữ liệu khách hàng...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center text-sm italic text-zinc-400">
            Không tìm thấy khách hàng phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Khách hàng</th>
                  <th className="px-6 py-4 font-bold">Liên hệ</th>
                  <th className="px-6 py-4 font-bold">Hạng</th>
                  <th className="px-6 py-4 font-bold">Địa chỉ</th>
                  <th className="px-6 py-4 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.maKH} className="transition-colors hover:bg-primary/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-mono text-[10px] font-bold uppercase text-zinc-400">{customer.maKH}</p>
                      <p className="font-bold text-zinc-900">{customer.hoTen}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-700">{customer.soDienThoai}</p>
                      <p className="text-xs text-zinc-400">{customer.email || "Chưa có email"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("rounded-full border px-3 py-1 text-[11px] font-black uppercase", membershipStyles[customer.hangThanhVien])}>
                        {membershipLabels[customer.hangThanhVien]}
                      </span>
                    </td>
                    <td className="max-w-[280px] px-6 py-4 text-zinc-500">
                      <p className="line-clamp-2">{customer.diaChi || "Chưa cập nhật"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!readonly && (
                          <button
                            type="button"
                            onClick={() => openEditModal(customer)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Sửa
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ id: customer.maKH, name: customer.hoTen })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/30 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/70 px-8 py-6">
              <div>
                <h2 className="text-xl font-black uppercase text-zinc-900">
                  {editingId ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
                </h2>
                <p className="text-xs font-medium text-zinc-500">Các trường bắt buộc đã được đánh dấu rõ trên form.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700"
                aria-label="Đóng form khách hàng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <Input label="Họ tên *" placeholder="Nguyễn Văn A" error={errors.hoTen?.message} {...register("hoTen")} />
                <Input label="Số điện thoại *" placeholder="0901234567" error={errors.soDienThoai?.message} {...register("soDienThoai")} />
                <Input label="Email" placeholder="khachhang@example.com" error={errors.email?.message} {...register("email")} />
                <Input label="Ngày sinh" type="date" error={errors.ngaySinh?.message} {...register("ngaySinh")} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Hạng thành viên</label>
                  <select
                    {...register("hangThanhVien")}
                    className="h-[42px] rounded-xl border border-soft/60 bg-white px-4 text-sm font-medium text-gray-800 outline-none transition focus:border-accent focus:ring-2 focus:ring-soft/40"
                  >
                    {HANG_KHACH_HANG_ENUM.map((level) => (
                      <option key={level} value={level}>
                        {membershipLabels[level]}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label="Ghi chú" placeholder="Sở thích, nhu cầu, lưu ý chăm sóc..." error={errors.ghiChu?.message} {...register("ghiChu")} />
                <div className="md:col-span-2">
                  <Input label="Địa chỉ" placeholder="Địa chỉ liên hệ" error={errors.diaChi?.message} {...register("diaChi")} />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-2xl px-8">
                  Hủy
                </Button>
                <Button type="submit" loading={isSubmitting} className="rounded-2xl px-8">
                  {editingId ? "Cập nhật" : "Lưu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/25 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <h3 className="text-lg font-black text-zinc-900">Xóa khách hàng?</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Xác nhận xóa <span className="font-bold text-zinc-900">{deleteConfirm.name}</span>. Thao tác này chỉ dành cho Quản lý.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button variant="danger" onClick={confirmDelete} className="h-11 rounded-2xl">
                Đồng ý xóa
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="h-11 rounded-2xl">
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
