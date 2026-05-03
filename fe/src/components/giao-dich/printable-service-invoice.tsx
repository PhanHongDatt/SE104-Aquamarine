"use client";

import React from "react";

interface PrintableServiceInvoiceProps {
  phieu: any;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export const PrintableServiceInvoice = React.forwardRef<
  HTMLDivElement,
  PrintableServiceInvoiceProps
>(({ phieu }, ref) => {
  if (!phieu) return null;
  return (
    <div
      ref={ref}
      className="print-font bg-white text-zinc-900 w-[720px] mx-auto px-8 py-8 text-[13px] leading-relaxed"
      id="printable-content"
    >
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 mb-5">
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">
              AQUAMARINE
            </h1>
            <p className="text-[11px] text-zinc-500 italic mt-1">
              Jewelry & Luxury Collection - Dịch Vụ
            </p>
            <div className="mt-3 space-y-0.5 text-[11px] text-zinc-600">
              <p>Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP. HCM</p>
              <p>Hotline: 0123 456 789</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <h2 className="text-3xl font-extrabold tracking-tight">
              PHIẾU DỊCH VỤ
            </h2>
            <div className="mt-3 space-y-1 text-[12px]">
              <p>
                <span className="font-semibold">Mã phiếu:</span>{" "}
                {phieu.soPhieu}
              </p>
              <p className="text-zinc-600">
                {new Date(phieu.ngayLap).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-6 mb-5 text-[12px]">
        <div className="space-y-1.5">
          <p>
            <span className="font-semibold">Khách hàng:</span>{" "}
            {phieu.tenKhachHang}
          </p>
          <p>
            <span className="font-semibold">SĐT:</span>{" "}
            {phieu.soDienThoai || "N/A"}
          </p>
        </div>
        <div className="space-y-1.5 text-right">
          <p>
            <span className="font-semibold">Ngày in:</span>{" "}
            {new Date().toLocaleDateString("vi-VN")}
          </p>
          <p>
            <span className="font-semibold">Trạng thái:</span>{" "}
            {phieu.tinhTrang === "HoanThanh" ? "Đã giao" : "Chưa giao"}
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border border-zinc-300 px-2 py-2 text-center w-8">STT</th>
            <th className="border border-zinc-300 px-3 py-2 text-left">Dịch vụ</th>
            <th className="border border-zinc-300 px-2 py-2 text-center w-10">SL</th>
            <th className="border border-zinc-300 px-3 py-2 text-right w-24">Đơn giá DV</th>
            <th className="border border-zinc-300 px-3 py-2 text-right w-24">Phát sinh</th>
            <th className="border border-zinc-300 px-3 py-2 text-right w-28">Thành tiền</th>
            <th className="border border-zinc-300 px-3 py-2 text-right w-28">Trả trước</th>
          </tr>
        </thead>
        <tbody>
          {phieu.chiTietDichVu?.map((item: any, index: number) => (
            <tr key={`${item.stt}-${index}`}>
              <td className="border border-zinc-300 px-2 py-2 text-center">{index + 1}</td>
              <td className="border border-zinc-300 px-3 py-2 font-medium">
                {item.loaiDichVu?.tenDV}
                {item.loaiDichVu?.nhomDV === 'KiemDinh' && (
                  <span className="text-[9px] text-zinc-400 block italic">(Yêu cầu kết quả khi giao)</span>
                )}
              </td>
              <td className="border border-zinc-300 px-2 py-2 text-center">{item.soLuong}</td>
              <td className="border border-zinc-300 px-3 py-2 text-right whitespace-nowrap">
                {formatCurrency(Number(item.donGiaDV))}
              </td>
              <td className="border border-zinc-300 px-3 py-2 text-right whitespace-nowrap">
                {formatCurrency(Number(item.chiPhiPhatSinh))}
              </td>
              <td className="border border-zinc-300 px-3 py-2 text-right font-semibold whitespace-nowrap">
                {formatCurrency(Number(item.thanhTien))}
              </td>
              <td className="border border-zinc-300 px-3 py-2 text-right whitespace-nowrap italic">
                {formatCurrency(Number(item.traTruoc))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-zinc-50 font-bold">
            <td colSpan={5} className="border border-zinc-300 px-3 py-2 text-right uppercase">Tổng cộng</td>
            <td className="border border-zinc-300 px-3 py-2 text-right">{formatCurrency(Number(phieu.tongTien))}</td>
            <td className="border border-zinc-300 px-3 py-2 text-right">{formatCurrency(Number(phieu.tongTraTruoc))}</td>
          </tr>
          <tr className="bg-zinc-100 font-extrabold text-[14px]">
            <td colSpan={5} className="border border-zinc-300 px-3 py-3 text-right uppercase text-primary">Tiền còn lại phải thu</td>
            <td colSpan={2} className="border border-zinc-300 px-3 py-3 text-right text-primary">
              {formatCurrency(Number(phieu.tongConLai))}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Regulations */}
      <div className="mt-5 border border-dashed border-zinc-300 rounded-md p-3 text-[10px] text-zinc-600 space-y-1">
        <p><strong>Quy định:</strong></p>
        <p>- Quý khách vui lòng mang theo phiếu này khi đến nhận lại sản phẩm.</p>
        <p>- Đối với dịch vụ kiểm định: Kết quả sẽ được ghi rõ trên phiếu trả và số chứng thư (nếu có).</p>
        <p>- Cửa hàng không chịu trách nhiệm đối với các khiếu nại sau khi sản phẩm đã được bàn giao và ký nhận.</p>
      </div>

      {/* Signature */}
      <div className="grid grid-cols-2 gap-10 mt-10 text-center text-[12px]">
        <div className="min-h-[100px] flex flex-col justify-between">
          <div>
            <p className="font-semibold uppercase">Khách hàng</p>
            <p className="text-[10px] text-zinc-400 mt-1">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="h-[40px]" />
        </div>
        <div className="min-h-[100px] flex flex-col justify-between">
          <div>
            <p className="font-semibold uppercase">Người lập phiếu</p>
            <p className="text-[10px] text-zinc-400 mt-1">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Aquamarine</p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-4 text-center">
        <p className="text-[10px] tracking-wide text-zinc-400 uppercase">
          Cảm ơn quý khách đã tin tưởng dịch vụ của Aquamarine
        </p>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background: white; }
          table, tr, td, th { page-break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
});

PrintableServiceInvoice.displayName = "PrintableServiceInvoice";
