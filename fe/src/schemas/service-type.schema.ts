import { z } from "zod";

export const serviceTypeSchema = z.object({
  maDV: z.string().optional(),
  tenDV: z.string().min(1, "Tên dịch vụ không được để trống"),
  donGiaDV: z.coerce.number().min(0, "Đơn giá phải lớn hơn hoặc bằng 0"),
  nhomDV: z.enum(["GiaCong", "KiemDinh"], {
    required_error: "Vui lòng chọn nhóm dịch vụ",
  }),
});

export type ServiceTypeFormValues = z.infer<typeof serviceTypeSchema>;
