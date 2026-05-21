import { z } from "zod";
import { isValidPhoneNumber } from "@/lib/business-rules";

export const HANG_KHACH_HANG_ENUM = ["Thuong", "Bac", "Vang", "KimCuong"] as const;

export const khachHangSchema = z.object({
  hoTen: z.string().min(1, "Họ tên khách hàng không được để trống").max(200, "Họ tên quá dài"),
  soDienThoai: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .refine(isValidPhoneNumber, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  diaChi: z.string().max(500, "Địa chỉ quá dài").optional().or(z.literal("")),
  ngaySinh: z.string().optional().or(z.literal("")),
  hangThanhVien: z.enum(HANG_KHACH_HANG_ENUM).default("Thuong"),
  ghiChu: z.string().max(500, "Ghi chú quá dài").optional().or(z.literal("")),
});

export type KhachHangInput = z.infer<typeof khachHangSchema>;
