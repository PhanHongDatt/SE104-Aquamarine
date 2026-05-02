"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, UserPlus, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { userSchema, userUpdateSchema, type UserFormValues, type UserUpdateFormValues } from "@/schemas/user.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createNguoiDung, updateNguoiDung } from "@/actions/user.action";

interface UserFormProps {
  groups: any[];
  initialData?: any;
  onSuccess?: () => void;
}

export function UserForm({ groups, initialData, onSuccess }: UserFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? userUpdateSchema : userSchema),
    defaultValues: initialData || {
      tenDangNhap: "",
      matKhau: "",
      hoTen: "",
      maNhom: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const res = isEdit 
        ? await updateNguoiDung(initialData.maND, data)
        : await createNguoiDung(data);

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
        <Input
          label="Họ tên nhân viên"
          placeholder="Nhập họ và tên"
          error={errors.hoTen?.message}
          {...register("hoTen")}
        />

        <Input
          label="Tên đăng nhập"
          placeholder="VD: nguyenvanan"
          disabled={isEdit}
          error={errors.tenDangNhap?.message}
          {...register("tenDangNhap")}
        />

        <div className="relative">
          <Input
            label={isEdit ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.matKhau?.message}
            {...register("matKhau")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase">Nhóm quyền</label>
          <select
            {...register("maNhom")}
            className="flex h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- Chọn nhóm quyền --</option>
            {groups.map((g) => (
              <option key={g.maNhom} value={g.maNhom}>
                {g.tenNhom === 'QUAN_LY' ? 'Quản lý / Admin' : 'Nhân viên bán hàng'}
              </option>
            ))}
          </select>
          {errors.maNhom && (
            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.maNhom.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="submit" loading={isSubmitting} className="flex-1 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
          {isEdit ? <Save className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
          {isEdit ? "Cập nhật tài khoản" : "Tạo tài khoản ngay"}
        </Button>
      </div>
    </form>
  );
}
