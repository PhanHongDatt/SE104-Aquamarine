import { z } from "zod";

export const donViTinhSchema = z.object({
  tenDVT: z.string().trim().min(1, "Tên đơn vị tính không được để trống").max(100, "Tên quá dài"),
  dinhLuong: z.coerce.number().min(0, "Định lượng không được nhỏ hơn 0").optional().nullable(),
});

export type DonViTinhInput = z.infer<typeof donViTinhSchema>;
