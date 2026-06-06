"use client";

import { useRef, useState } from "react";
import { Download, Eye, Printer, ShoppingBag } from "lucide-react";
import type { PhieuMuaHang } from "@/types/model";
import { Modal } from "@/components/ui/modal";
import { PrintablePurchaseInvoice } from "./printable-purchase-invoice";

interface PurchaseInvoiceListProps {
  data: PhieuMuaHang[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function PurchaseInvoiceList({ data }: PurchaseInvoiceListProps) {
  const [selectedPhieu, setSelectedPhieu] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const openDetail = (phieu: PhieuMuaHang) => {
    setSelectedPhieu(phieu);
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((style) => style.outerHTML)
      .join("");

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>PhieuMua_${selectedPhieu?.soPhieu || "PurchaseInvoice"}</title>
          ${styles}
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .print-container { width: 100% !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printRef.current.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.parent.document.body.removeChild(window.frameElement);
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {data.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 italic cursor-default select-none">
          Chưa có phiếu mua hàng nào được lập.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600 cursor-default select-none">
                <th className="px-6 py-4">Số phiếu</th>
                <th className="px-6 py-4">Ngày lập</th>
                <th className="px-6 py-4">Nhà cung cấp</th>
                <th className="px-6 py-4 text-right">Tổng tiền</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((phieu) => (
                <tr key={phieu.soPhieu} className="hover:bg-zinc-50/60 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{phieu.soPhieu}</td>
                  <td className="px-6 py-4 text-zinc-600">{new Date(phieu.ngayLap).toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4 font-medium text-zinc-800">{phieu.nhaCungCap?.tenNCC || phieu.maNCC}</td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900">{formatCurrency(Number(phieu.tongTien))}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openDetail(phieu)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-semibold text-xs border border-primary/10 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!selectedPhieu}
        onClose={() => setSelectedPhieu(null)}
        size="lg"
        title="Chi tiết phiếu mua hàng"
      >
        {selectedPhieu && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 cursor-default select-none">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Số phiếu</p>
                <p className="font-mono text-sm text-zinc-800">{selectedPhieu.soPhieu}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Ngày lập</p>
                <p className="text-sm text-zinc-800">{new Date(selectedPhieu.ngayLap).toLocaleDateString("vi-VN")}</p>
              </div>
	              <div className="col-span-2 space-y-1 pt-2 border-t border-zinc-200/50">
	                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Nhà cung cấp</p>
	                <p className="text-sm font-bold text-zinc-900">{selectedPhieu.nhaCungCap?.tenNCC || selectedPhieu.maNCC}</p>
	                <p className="text-xs text-zinc-500">Địa chỉ: {selectedPhieu.nhaCungCap?.diaChi}</p>
	                <p className="text-xs text-zinc-500">Số điện thoại: {selectedPhieu.nhaCungCap?.soDienThoai}</p>
	              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 cursor-default select-none">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Danh mục hàng nhập
              </h4>
              <div className="rounded-2xl border border-zinc-100 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50/80 border-b border-zinc-100 font-bold text-zinc-500">
	                    <tr className="cursor-default select-none">
	                      <th className="px-4 py-3 text-center">STT</th>
	                      <th className="px-4 py-3">Sản phẩm</th>
	                      <th className="px-4 py-3">Loại sản phẩm</th>
	                      <th className="px-4 py-3 text-center">SL</th>
	                      <th className="px-4 py-3 text-center">ĐVT</th>
	                      <th className="px-4 py-3 text-right">Đơn giá nhập</th>
	                      <th className="px-4 py-3 text-right">Thành tiền</th>
	                    </tr>
	                  </thead>
	                  <tbody className="divide-y divide-zinc-50">
	                    {selectedPhieu.chiTietMuaHang?.map((item: any, index: number) => (
	                      <tr key={item.maSP}>
	                        <td className="px-4 py-3 text-center font-mono text-zinc-400">{index + 1}</td>
	                        <td className="px-4 py-3">
	                          <p className="font-bold text-zinc-800 line-clamp-1">{item.sanPham?.tenSP}</p>
	                          <p className="text-[9px] font-mono text-zinc-400 uppercase">{item.maSP}</p>
	                        </td>
	                        <td className="px-4 py-3 text-zinc-600">{item.sanPham?.loaiSanPham?.tenLSP}</td>
	                        <td className="px-4 py-3 text-center font-medium">{item.soLuong}</td>
	                        <td className="px-4 py-3 text-center font-medium">{item.sanPham?.donViTinh?.tenDVT}</td>
	                        <td className="px-4 py-3 text-right">{formatCurrency(Number(item.donGia))}</td>
	                        <td className="px-4 py-3 text-right font-bold text-zinc-900">{formatCurrency(Number(item.thanhTien))}</td>
	                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary/5 font-bold">
	                    <tr className="cursor-default select-none">
	                      <td colSpan={6} className="px-4 py-3 text-zinc-600 text-right">Tổng thanh toán:</td>
	                      <td className="px-4 py-3 text-right text-primary text-sm font-black">
                        {formatCurrency(Number(selectedPhieu.tongTien))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

	            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
	              <button
	                onClick={handlePrint}
	                className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors"
	              >
	                <Printer className="w-4 h-4" />
	                In phiếu
	              </button>
	              <button
	                onClick={handlePrint}
	                className="flex items-center justify-center gap-2 px-6 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors"
	              >
	                <Download className="w-4 h-4" />
	                Tải xuống (PDF)
	              </button>
	              <button
	                onClick={() => setSelectedPhieu(null)}
	                className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
              >
                Đóng
	              </button>
	            </div>

	            <div className="hidden">
	              <div ref={printRef}>
	                <PrintablePurchaseInvoice phieu={selectedPhieu} />
	              </div>
	            </div>
	          </div>
	        )}
      </Modal>
    </div>
  );
}
