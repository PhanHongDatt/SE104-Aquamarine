import { z } from "zod";

export const HAM_LUONG_ENUM = ["K24", "K22", "K18", "K14", "K10", "BAC_925", "KHONG_AP_DUNG"] as const;

export const HAM_LUONG_LABELS: Record<(typeof HAM_LUONG_ENUM)[number], string> = {
  K24: "24K",
  K22: "22K",
  K18: "18K",
  K14: "14K",
  K10: "10K",
  BAC_925: "Bạc 925",
  KHONG_AP_DUNG: "Không áp dụng",
};

export const sanPhamSchema = z.object({
  tenSP: z.string().min(1, "Tên sản phẩm không được để trống").max(200, "Tên quá dài"),
  maLSP: z.string().min(1, "Vui lòng chọn loại sản phẩm"),
  hamLuong: z.enum(HAM_LUONG_ENUM, {
    errorMap: () => ({ message: "Hàm lượng không hợp lệ" }),
  }),
  trongLuong: z.coerce.number().gt(0, "Trọng lượng phải lớn hơn 0"),
  maDVT: z.string().min(1, "Đơn vị tính không được để trống"),
  donGiaNhap: z.coerce.number().gt(0, "Giá nhập phải lớn hơn 0"),
  donGiaBan: z.coerce.number().optional(), // Sẽ được tính tự động ở server nhưng client cần gửi lên
});

export const sanPhamUpdateSchema = sanPhamSchema.pick({
  tenSP: true,
  maLSP: true,
});

export type SanPhamInput = z.infer<typeof sanPhamSchema>;
export type SanPhamUpdateInput = z.infer<typeof sanPhamUpdateSchema>;
