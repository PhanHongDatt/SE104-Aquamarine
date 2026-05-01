import { z } from "zod";

export const donViTinhSchema = z.object({
  tenDVT: z.string().min(1, "Tên đơn vị tính không được để trống").max(100, "Tên quá dài"),
});

export type DonViTinhInput = z.infer<typeof donViTinhSchema>;
