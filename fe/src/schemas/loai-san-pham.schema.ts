import { z } from "zod";

export const loaiSanPhamSchema = z.object({
  tenLSP: z.string().trim().min(1, "Tên loại sản phẩm không được để trống").max(100, "Tên quá dài"),
  maDVT: z.string().min(1, "Vui lòng chọn đơn vị tính mặc định"),
  phanTramLoiNhuan: z.coerce
    .number()
    .min(0, "Lợi nhuận không được nhỏ hơn 0%")
    .max(100, "Lợi nhuận không được vượt quá 100%"),
});

export type LoaiSanPhamInput = z.infer<typeof loaiSanPhamSchema>;
