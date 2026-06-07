import { z } from "zod";

export const HAM_LUONG_ENUM = ["K24", "K22", "K18", "K14", "K10"] as const;

export const sanPhamSchema = z.object({
  tenSP: z.string().min(1, "Tên sản phẩm không được để trống").max(200, "Tên quá dài"),
  maLSP: z.string().min(1, "Vui lòng chọn loại sản phẩm"),
  hamLuong: z.enum(HAM_LUONG_ENUM, {
    errorMap: () => ({ message: "Hàm lượng không hợp lệ" }),
  }),
  trongLuong: z.coerce.number().gt(0, "Trọng lượng phải lớn hơn 0"),
  maDVT: z.string().min(1, "Đơn vị tính không được để trống"),
  tonToiThieu: z.coerce.number().int("Tồn tối thiểu phải là số nguyên").min(0, "Tồn tối thiểu là 0").max(1000, "Tồn tối thiểu tối đa là 1000").optional(),
  donGiaNhap: z.coerce.number().gt(0, "Giá nhập phải lớn hơn 0"),
  donGiaBan: z.coerce.number().optional(), // Sẽ được tính tự động ở server nhưng client cần gửi lên
});

export type SanPhamInput = z.infer<typeof sanPhamSchema>;
