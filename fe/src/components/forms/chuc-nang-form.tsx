"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { chucNangSchema, chucNangUpdateSchema, type ChucNangFormValues, type ChucNangUpdateFormValues } from "@/schemas/permission.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createChucNang, updateChucNang } from "@/actions/phan-quyen.action";

interface ChucNangFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function ChucNangForm({ initialData, onSuccess }: ChucNangFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const getErrorMessage = (message: unknown) =>
    typeof message === "string" ? message : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChucNangFormValues | ChucNangUpdateFormValues>({
    resolver: zodResolver(isEdit ? chucNangUpdateSchema : chucNangSchema),
    defaultValues: initialData
      ? { tenChucNang: initialData.tenChucNang, tenManHinhDuocLoad: initialData.tenManHinhDuocLoad }
      : { maChucNang: "", tenChucNang: "", tenManHinhDuocLoad: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = isEdit
        ? await updateChucNang(initialData.maChucNang, data)
        : await createChucNang(data);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        {!isEdit && (
          <Input
            label="Mã chức năng"
            placeholder="VD: DM_DASH, GD_BAN"
            error={getErrorMessage((errors as any).maChucNang?.message)}
            {...register("maChucNang")}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
              e.target.value = value;
              register("maChucNang").onChange(e);
            }}
          />
        )}

        <Input
          label="Tên chức năng"
          placeholder="VD: Quản lý sản phẩm"
          error={getErrorMessage(errors.tenChucNang?.message)}
          {...register("tenChucNang")}
        />

        <Input
          label="Đường dẫn màn hình"
          placeholder="VD: /admin/danh-muc/san-pham"
          error={getErrorMessage((errors as any).tenManHinhDuocLoad?.message)}
          {...register("tenManHinhDuocLoad")}
        />
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="submit" loading={isSubmitting} className="flex-1 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
          {isEdit ? <Save className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {isEdit ? "Cập nhật chức năng" : "Tạo chức năng mới"}
        </Button>
      </div>
    </form>
  );
}
