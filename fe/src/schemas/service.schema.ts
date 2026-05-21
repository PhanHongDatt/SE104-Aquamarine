import { z } from "zod";

export const serviceReceiptItemSchema = z.object({
  maDV: z.string().min(1, "Vui lòng chọn loại dịch vụ"),
  tenDV: z.string().optional(),
  nhomDV: z.enum(["GiaCong", "KiemDinh"]).optional(),
  donGiaDV: z.coerce.number().gt(0, "Đơn giá dịch vụ phải lớn hơn 0"),
  chiPhiPhatSinh: z.coerce.number().min(0),
  donGiaDuocTinh: z.coerce.number().gt(0, "Đơn giá được tính phải lớn hơn 0"),
  soLuong: z.coerce.number().min(1, "Số lượng phải ít nhất là 1"),
  thanhTien: z.coerce.number().gt(0, "Thành tiền phải lớn hơn 0"),
  traTruoc: z.coerce.number().min(0),
  conLai: z.coerce.number().min(0),
  // Fields for Appraisal (Kiểm định) when delivered, but might be useful in UI
  ketQua: z.string().optional(),
  soChungThu: z.string().optional(),
});

export const serviceReceiptSchema = z.object({
  soPhieu: z.string().min(1, "Số phiếu không được để trống"),
  ngayLap: z.date(),
  maKH: z.string().optional(),
  tenKhachHang: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  soDienThoai: z.string().min(1, "Vui lòng nhập số điện thoại"),
  chiTietDichVu: z.array(serviceReceiptItemSchema).min(1, "Phiếu phải có ít nhất 1 dịch vụ"),
  tongTien: z.coerce.number().gt(0, "Tổng tiền phải lớn hơn 0"),
  tongTraTruoc: z.coerce.number().min(0),
  tongConLai: z.coerce.number().min(0),
});

export type ServiceReceiptFormValues = z.infer<typeof serviceReceiptSchema>;
export type ServiceReceiptItemValues = z.infer<typeof serviceReceiptItemSchema>;
