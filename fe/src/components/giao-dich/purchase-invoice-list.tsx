"use client";

import { useState } from "react";
import { Eye, ShoppingBag, Truck, Calendar, Hash } from "lucide-react";
import type { PhieuMuaHang } from "@/types/model";
import { Modal } from "@/components/ui/modal";

interface PurchaseInvoiceListProps {
  data: PhieuMuaHang[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function PurchaseInvoiceList({ data }: PurchaseInvoiceListProps) {
  const [selectedPhieu, setSelectedPhieu] = useState<any | null>(null);

  const openDetail = (phieu: PhieuMuaHang) => {
    setSelectedPhieu(phieu);
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
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3 text-center">SL</th>
                      <th className="px-4 py-3 text-right">Đơn giá nhập</th>
                      <th className="px-4 py-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {selectedPhieu.chiTietMuaHang?.map((item: any) => (
                      <tr key={item.maSP}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-zinc-800 line-clamp-1">{item.sanPham?.tenSP}</p>
                          <p className="text-[9px] font-mono text-zinc-400 uppercase">{item.maSP}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{item.soLuong}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(Number(item.donGia))}</td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900">{formatCurrency(Number(item.thanhTien))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary/5 font-bold">
                    <tr className="cursor-default select-none">
                      <td colSpan={3} className="px-4 py-3 text-zinc-600 text-right">Tổng thanh toán:</td>
                      <td className="px-4 py-3 text-right text-primary text-sm font-black">
                        {formatCurrency(Number(selectedPhieu.tongTien))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPhieu(null)}
                className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
