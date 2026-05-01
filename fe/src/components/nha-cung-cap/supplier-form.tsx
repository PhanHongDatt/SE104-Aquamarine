"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

import { nhaCungCapSchema, type NhaCungCapFormValues } from "@/schemas/nha-cung-cap.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SupplierFormProps {
  initialData?: any;
  onSubmit: (data: NhaCungCapFormValues) => Promise<void>;
  onCancel: () => void;
}

export function SupplierForm({ initialData, onSubmit, onCancel }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NhaCungCapFormValues>({
    resolver: zodResolver(nhaCungCapSchema),
    defaultValues: initialData || {
      tenNCC: "",
      diaChi: "",
      soDienThoai: "",
      nguoiLienHe: "",
    },
  });

  const handleFormSubmit = async (data: NhaCungCapFormValues) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Tên nhà cung cấp"
        placeholder="Nhập tên công ty/đối tác"
        error={errors.tenNCC?.message}
        {...register("tenNCC")}
      />

      <Input
        label="Địa chỉ"
        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
        error={errors.diaChi?.message}
        {...register("diaChi")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Số điện thoại"
          placeholder="Ví dụ: 0901234567"
          error={errors.soDienThoai?.message}
          {...register("soDienThoai")}
        />
        <Input
          label="Người liên hệ"
          placeholder="Tên người đại diện"
          error={errors.nguoiLienHe?.message}
          {...register("nguoiLienHe")}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
        <Button type="submit" loading={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Lưu thông tin
        </Button>
      </div>
    </form>
  );
}
