import { z } from "zod";

export const salesInvoiceItemSchema = z.object({
  maSP: z.string().min(1, "Vui lòng chọn sản phẩm"),
  tenSP: z.string().optional(),
  tenLSP: z.string().optional(),
  maDVT: z.string().optional(),
  tenDVT: z.string().optional(),
  soLuong: z.coerce.number().min(1, "Số lượng phải ít nhất là 1"),
  donGiaNhap: z.coerce.number().optional(),
  phanTramLoiNhuan: z.coerce.number().optional(),
  donGiaBan: z.coerce.number().gt(0, "Đơn giá bán phải lớn hơn 0"),
  thanhTien: z.coerce.number().gt(0, "Thành tiền phải lớn hơn 0"),
  tonKho: z.coerce.number().optional(),
});

export const salesInvoiceSchema = z.object({
  soPhieu: z.string().min(1, "Số phiếu không được để trống"),
  ngayLap: z.date(),
  maKH: z.string().optional(),
  tenKhachHang: z.string().trim().min(1, "Vui lòng nhập tên khách hàng"),
  soDienThoai: z.string().trim().optional(),
  chiTietBanHang: z.array(salesInvoiceItemSchema).min(1, "Phiếu phải có ít nhất 1 sản phẩm"),
  tongTien: z.coerce.number().gt(0, "Tổng tiền phải lớn hơn 0"),
});

export type SalesInvoiceFormValues = z.infer<typeof salesInvoiceSchema>;
export type SalesInvoiceItemValues = z.infer<typeof salesInvoiceItemSchema>;
