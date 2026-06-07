"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { groupSchema, groupUpdateSchema, type GroupFormValues, type GroupUpdateFormValues } from "@/schemas/permission.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createNhomNguoiDung, updateNhomNguoiDung } from "@/actions/phan-quyen.action";

interface GroupFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function GroupForm({ initialData, onSuccess }: GroupFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const getErrorMessage = (message: unknown) =>
    typeof message === "string" ? message : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues | GroupUpdateFormValues>({
    resolver: zodResolver(isEdit ? groupUpdateSchema : groupSchema),
    defaultValues: initialData
      ? { tenNhom: initialData.tenNhom }
      : { maNhom: "", tenNhom: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = isEdit
        ? await updateNhomNguoiDung(initialData.maNhom, data)
        : await createNhomNguoiDung(data);

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
            label="Mã nhóm"
            placeholder="VD: GIAM_DOC, KETOAN"
            error={getErrorMessage((errors as any).maNhom?.message)}
            {...register("maNhom")}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
              e.target.value = value;
              register("maNhom").onChange(e);
            }}
          />
        )}

        <Input
          label="Tên nhóm người dùng"
          placeholder="VD: Giám đốc, Kế toán"
          error={getErrorMessage(errors.tenNhom?.message)}
          {...register("tenNhom")}
        />
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="submit" loading={isSubmitting} className="flex-1 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
          {isEdit ? <Save className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {isEdit ? "Cập nhật nhóm" : "Tạo nhóm mới"}
        </Button>
      </div>
    </form>
  );
}
