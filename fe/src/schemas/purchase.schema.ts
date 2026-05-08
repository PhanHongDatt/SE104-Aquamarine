import { z } from "zod";

export const purchaseInvoiceItemSchema = z.object({
  maSP: z.string().min(1, "Vui lòng chọn sản phẩm"),
  tenSP: z.string().optional(),
  tenLSP: z.string().optional(),
  maDVT: z.string().optional(),
  tenDVT: z.string().optional(),
  soLuong: z.coerce.number().min(1, "Số lượng phải ít nhất là 1"),
  donGiaMua: z.coerce.number().gt(0, "Đơn giá mua phải lớn hơn 0"),
  thanhTien: z.coerce.number().gt(0, "Thành tiền phải lớn hơn 0"),
});

export const purchaseInvoiceSchema = z.object({
  soPhieu: z.string().min(1, "Số phiếu không được để trống"),
  ngayLap: z.date(),
  maNCC: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  chiTietMuaHang: z.array(purchaseInvoiceItemSchema).min(1, "Phiếu phải có ít nhất 1 sản phẩm"),
  tongTien: z.coerce.number().gt(0, "Tổng tiền phải lớn hơn 0"),
});

export type PurchaseInvoiceFormValues = z.infer<typeof purchaseInvoiceSchema>;
export type PurchaseInvoiceItemValues = z.infer<typeof purchaseInvoiceItemSchema>;
