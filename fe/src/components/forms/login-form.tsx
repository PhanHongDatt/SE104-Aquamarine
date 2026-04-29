"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock } from "lucide-react";

import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PasswordStrength } from "@/components/ui/password-strength";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
        return;
      }

      const session = await getSession();
      if (session?.user?.role === "QUAN_LY") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setServerError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert
          variant="error"
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      <Input
        label="Tên đăng nhập"
        placeholder="Nhập tên đăng nhập"
        autoComplete="username"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.username?.message}
        {...register("username")}
      />

      <div>
        <Input
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          leftIcon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength password={passwordValue} />
      </div>

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        disabled={!isValid}
        className="w-full mt-2"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
