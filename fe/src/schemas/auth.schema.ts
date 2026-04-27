import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
    .regex(
      /[^A-Za-z0-9]/,
      "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"
    ),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Yếu", color: "bg-red-400" };
  if (score <= 4) return { score, label: "Trung bình", color: "bg-yellow-400" };
  return { score, label: "Mạnh", color: "bg-green-500" };
}
