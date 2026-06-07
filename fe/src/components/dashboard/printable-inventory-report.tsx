"use client";

import React from "react";
import { BaoCaoTonKhoDetailedItem } from "@/actions/bao-cao";

interface PrintableInventoryReportProps {
  data: BaoCaoTonKhoDetailedItem[];
  thang: number;
  nam: number;
}

export const PrintableInventoryReport = React.forwardRef<
  HTMLDivElement,
  PrintableInventoryReportProps
>(({ data, thang, nam }, ref) => {
  return (
    <div
      ref={ref}
      className="print-font bg-white text-zinc-900 w-[720px] mx-auto px-8 py-8 text-[13px] leading-relaxed"
    >
      {/* Header */}
      <div className="text-center border-b-2 border-zinc-800 pb-6 mb-8">
        <h1 className="text-2xl font-extrabold uppercase tracking-widest">
          AQUAMARINE JEWELRY
        </h1>
        <p className="text-[11px] text-zinc-500 uppercase tracking-tighter mt-1">
          Hệ thống quản lý cửa hàng vàng bạc đá quý
        </p>
        <div className="mt-6">
          <h2 className="text-3xl font-black tracking-tight">BÁO CÁO TỒN KHO</h2>
          <p className="text-lg font-bold text-zinc-600 mt-1">
            Tháng {thang} Năm {nam}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="flex justify-between items-end mb-6 text-[11px]">
        <div>
          <p><span className="font-bold">Ngày lập báo cáo:</span> {new Date().toLocaleDateString('vi-VN')}</p>
          <p><span className="font-bold">Người lập:</span> Hệ thống</p>
        </div>
        <div className="text-right italic text-zinc-500">
          Đơn vị tính: Theo danh mục sản phẩm
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-zinc-800 text-[10px]">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border border-zinc-800 p-2 text-center w-8">STT</th>
            <th className="border border-zinc-800 p-2 text-left">Sản phẩm</th>
            <th className="border border-zinc-800 p-2 text-right">Tồn đầu</th>
            <th className="border border-zinc-800 p-2 text-right">Mua vào</th>
            <th className="border border-zinc-800 p-2 text-right">Bán ra</th>
            <th className="border border-zinc-800 p-2 text-right">Tồn cuối</th>
            <th className="border border-zinc-800 p-2 text-right">Tồn tối thiểu</th>
            <th className="border border-zinc-800 p-2 text-center">ĐVT</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.maSP} className={item.canhBao ? "bg-red-50" : ""}>
              <td className="border border-zinc-800 p-2 text-center">{index + 1}</td>
              <td className="border border-zinc-800 p-2 font-bold">
                {item.tenSP}
                <br />
                <span className="text-[8px] font-mono text-zinc-400">{item.maSP}</span>
              </td>
              <td className="border border-zinc-800 p-2 text-right">{item.tonDau}</td>
              <td className="border border-zinc-800 p-2 text-right">{item.slMuaVao}</td>
              <td className="border border-zinc-800 p-2 text-right">{item.slBanRa}</td>
              <td className="border border-zinc-800 p-2 text-right font-bold">{item.tonCuoi}</td>
              <td className="border border-zinc-800 p-2 text-right italic text-zinc-500">{item.tonToiThieu}</td>
              <td className="border border-zinc-800 p-2 text-center">{item.tenDVT}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Warning Legend */}
      {data.some(item => item.canhBao) && (
        <div className="mt-4 text-[9px] text-red-600 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300" />
          <span>Cảnh báo tồn thấp: {data.filter(item => item.canhBao).length} sản phẩm có Tồn cuối &lt; Tồn tối thiểu</span>
        </div>
      )}

      {/* Signature */}
      <div className="grid grid-cols-2 gap-10 mt-12 text-center text-[12px]">
        <div className="min-h-[120px] flex flex-col justify-between">
          <p className="font-bold uppercase italic">Người phê duyệt</p>
          <p className="text-[10px] text-zinc-400">(Ký và ghi rõ họ tên)</p>
        </div>
        <div className="min-h-[120px] flex flex-col justify-between">
          <p className="font-bold uppercase italic">Người lập báo cáo</p>
          <p className="text-[10px] text-zinc-400">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          table, tr, td, th { page-break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
});

PrintableInventoryReport.displayName = "PrintableInventoryReport";
