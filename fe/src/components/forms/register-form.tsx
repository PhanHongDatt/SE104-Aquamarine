"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import { registerNguoiDung } from "@/actions/user.action";
import { registerUserSchema, type RegisterUserFormValues } from "@/schemas/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterUserFormValues>({
    resolver: zodResolver(registerUserSchema),
    mode: "onChange",
  });

  const password = watch("matKhau", "");

  const onSubmit = async (values: RegisterUserFormValues) => {
    setServerError(null);
    const result = await registerNguoiDung(values);
    if (result.success) {
      toast.success(result.message);
      router.push("/dang-nhap");
      return;
    }
    setServerError(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <Input
        label="Họ và tên"
        placeholder="Nhập họ tên"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.hoTen?.message}
        {...register("hoTen")}
      />
      <Input
        label="Tên đăng nhập"
        placeholder="Tối thiểu 3 ký tự"
        autoComplete="username"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.tenDangNhap?.message}
        {...register("tenDangNhap")}
      />
      <div>
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự, có hoa/thường/số/ký tự đặc biệt"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.matKhau?.message}
          {...register("matKhau")}
        />
        <PasswordStrength password={password} />
      </div>
      <Input
        label="Xác nhận mật khẩu"
        type="password"
        autoComplete="new-password"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.xacNhanMatKhau?.message}
        {...register("xacNhanMatKhau")}
      />

      <Button type="submit" size="lg" loading={isSubmitting} disabled={!isValid} className="w-full">
        Đăng ký tài khoản
      </Button>

      <div className="text-center text-sm text-zinc-500">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}
