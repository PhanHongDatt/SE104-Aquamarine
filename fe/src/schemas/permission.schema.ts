import { z } from "zod";

// ── Nhóm người dùng ──────────────────────────────────────────
export const groupSchema = z.object({
  maNhom: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã nhóm")
    .max(6, "Mã nhóm tối đa 6 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã nhóm chỉ chứa chữ hoa, số và dấu gạch dưới"),
  tenNhom: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên nhóm")
    .max(100, "Tên nhóm tối đa 100 ký tự"),
});

export type GroupFormValues = z.infer<typeof groupSchema>;

export const groupUpdateSchema = z.object({
  tenNhom: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên nhóm")
    .max(100, "Tên nhóm tối đa 100 ký tự"),
});

export type GroupUpdateFormValues = z.infer<typeof groupUpdateSchema>;

// ── Chức năng ────────────────────────────────────────────────
export const chucNangSchema = z.object({
  maChucNang: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã chức năng")
    .max(6, "Mã chức năng tối đa 6 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã chức năng chỉ chứa chữ hoa, số và dấu gạch dưới"),
  tenChucNang: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên chức năng")
    .max(200, "Tên chức năng tối đa 200 ký tự"),
  tenManHinhDuocLoad: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập đường dẫn")
    .max(300, "Đường dẫn tối đa 300 ký tự"),
});

export type ChucNangFormValues = z.infer<typeof chucNangSchema>;

export const chucNangUpdateSchema = z.object({
  tenChucNang: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên chức năng")
    .max(200, "Tên chức năng tối đa 200 ký tự"),
  tenManHinhDuocLoad: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập đường dẫn")
    .max(300, "Đường dẫn tối đa 300 ký tự"),
});

export type ChucNangUpdateFormValues = z.infer<typeof chucNangUpdateSchema>;
