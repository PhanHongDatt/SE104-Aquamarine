import { z } from "zod";

export const userSchema = z.object({
  maND: z.string().optional(),
  tenDangNhap: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
    .max(50, "Tên đăng nhập tối đa 50 ký tự"),
  matKhau: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"),
  hoTen: z
    .string()
    .min(1, "Vui lòng nhập họ tên")
    .max(200, "Họ tên tối đa 200 ký tự"),
  maNhom: z.string().min(1, "Vui lòng chọn nhóm người dùng"),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const userUpdateSchema = userSchema.extend({
  matKhau: z
    .string()
    .optional()
    .refine((val) => !val || (val.length >= 8 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)), {
      message: "Mật khẩu mới không đủ mạnh (tối thiểu 8 ký tự, 1 hoa, 1 thường, 1 số, 1 đặc biệt)",
    }),
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

export const registerUserSchema = userSchema
  .omit({ maNhom: true })
  .extend({
    xacNhanMatKhau: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.matKhau === data.xacNhanMatKhau, {
    path: ["xacNhanMatKhau"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type RegisterUserFormValues = z.infer<typeof registerUserSchema>;

export const changePasswordSchema = z
  .object({
    matKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    matKhauMoi: userSchema.shape.matKhau,
    xacNhanMatKhau: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.matKhauMoi === data.xacNhanMatKhau, {
    path: ["xacNhanMatKhau"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
