import { z } from "zod";

export const systemSettingsSchema = z.object({
  phanTramLoiNhuanToiThieu: z.coerce
    .number()
    .min(0, "Tỷ lệ lợi nhuận tối thiểu là 0%")
    .max(100, "Tỷ lệ lợi nhuận tối đa là 100%"),
  soLuongTonKhoToiThieu: z.coerce
    .number()
    .min(0, "Số lượng tồn tối thiểu là 0")
    .max(1000, "Số lượng tồn tối đa là 1000"),
  tiLeTraTruocToiThieu: z.coerce
    .number()
    .min(0, "Tỷ lệ trả trước tối thiểu là 0%")
    .max(100, "Tỷ lệ trả trước tối đa là 100%"),
});

export type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;
