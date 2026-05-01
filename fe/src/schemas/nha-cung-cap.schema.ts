import { z } from "zod";

export const nhaCungCapSchema = z.object({
  tenNCC: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  diaChi: z.string().min(1, "Địa chỉ không được để trống"),
  soDienThoai: z.string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
  nguoiLienHe: z.string().min(1, "Người liên hệ không được để trống"),
});

export type NhaCungCapFormValues = z.infer<typeof nhaCungCapSchema>;
