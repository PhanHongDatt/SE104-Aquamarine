"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { serviceTypeSchema, type ServiceTypeFormValues } from "@/schemas/service-type.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLoaiDichVu, updateLoaiDichVu } from "@/actions/service.action";

interface ServiceTypeFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function ServiceTypeForm({ initialData, onSuccess }: ServiceTypeFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: initialData || {
      tenDV: "",
      donGiaDV: 0,
      nhomDV: "GiaCong",
    },
  });

  const onSubmit = async (data: ServiceTypeFormValues) => {
    try {
      const res = isEdit 
        ? await updateLoaiDichVu(initialData.maDV, data)
        : await createLoaiDichVu(data);

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi hệ thống");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Input
          label="Mã dịch vụ"
          disabled
          value={isEdit ? initialData.maDV : "(Tự động sinh)"}
          className="bg-zinc-50 cursor-default text-zinc-400"
        />

        <Input
          label="Tên dịch vụ"
          placeholder="VD: Đánh bóng trang sức"
          error={errors.tenDV?.message}
          {...register("tenDV")}
        />

        <Input
          label="Đơn giá dịch vụ"
          type="number"
          placeholder="0"
          error={errors.donGiaDV?.message}
          {...register("donGiaDV")}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase">Nhóm dịch vụ</label>
          <select
            {...register("nhomDV")}
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="GiaCong">Gia công (chế tác, sửa chữa...)</option>
            <option value="KiemDinh">Kiểm định (cân thử, giám định...)</option>
          </select>
          {errors.nhomDV && (
            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.nhomDV.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="submit" loading={isSubmitting} className="flex-1 rounded-xl font-bold">
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? "Cập nhật" : "Lưu dịch vụ"}
        </Button>
      </div>
    </form>
  );
}
