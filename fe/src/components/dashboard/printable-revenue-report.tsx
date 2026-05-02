"use client";

import React from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import { BaoCaoDoanhThuDetailedResult } from "@/actions/bao-cao";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

interface PrintableRevenueReportProps {
  data: BaoCaoDoanhThuDetailedResult;
  thang: number;
  nam: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export const PrintableRevenueReport = React.forwardRef<
  HTMLDivElement,
  PrintableRevenueReportProps
>(({ data, thang, nam }, ref) => {
  return (
    <div
      ref={ref}
      className={`${beVietnam.className} bg-white text-zinc-900 w-[720px] mx-auto px-8 py-8 text-[13px] leading-relaxed`}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-zinc-800 pb-6 mb-8">
        <h1 className="text-2xl font-extrabold uppercase tracking-widest">
          AQUAMARINE JEWELRY
        </h1>
        <p className="text-[11px] text-zinc-500 uppercase tracking-tighter mt-1">
          Hệ thống quản lý cửa hàng vàng bạc đá quy
        </p>
        <div className="mt-6">
          <h2 className="text-3xl font-black tracking-tight">BÁO CÁO DOANH THU</h2>
          <p className="text-lg font-bold text-zinc-600 mt-1">
            Tháng {thang} Năm {nam}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="flex justify-between items-end mb-6 text-[11px]">
        <div>
          <p><span className="font-bold">Ngày lập báo cáo:</span> {new Date().toLocaleDateString('vi-VN')}</p>
          <p><span className="font-bold">Người lập:</span> Ban Quản Lý</p>
        </div>
        <div className="text-right italic text-zinc-500">
          Đơn vị tính: Việt Nam Đồng (VND)
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-zinc-800 text-[11px]">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border border-zinc-800 p-2 text-center w-12">Ngày</th>
            <th className="border border-zinc-800 p-2 text-right">Doanh thu bán hàng</th>
            <th className="border border-zinc-800 p-2 text-right">Doanh thu dịch vụ</th>
            <th className="border border-zinc-800 p-2 text-right">Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          {data.dailyData.map((item) => (
            <tr key={item.ngay}>
              <td className="border border-zinc-800 p-2 text-center font-mono">
                {item.ngay.toString().padStart(2, '0')}/{thang.toString().padStart(2, '0')}
              </td>
              <td className="border border-zinc-800 p-2 text-right">
                {formatCurrency(Number(item.dtBanHang))}
              </td>
              <td className="border border-zinc-800 p-2 text-right">
                {formatCurrency(Number(item.dtDichVu))}
              </td>
              <td className="border border-zinc-800 p-2 text-right font-bold">
                {formatCurrency(Number(item.tongDT))}
              </td>
            </tr>
          ))}
          {data.dailyData.length === 0 && (
            <tr>
              <td colSpan={4} className="border border-zinc-800 p-8 text-center text-zinc-400 italic">
                Chưa có dữ liệu giao dịch trong tháng này
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-zinc-50">
          <tr className="font-black text-sm uppercase">
            <td className="border border-zinc-800 p-3 text-right">TỔNG CỘNG</td>
            <td className="border border-zinc-800 p-3 text-right text-blue-700">
              {formatCurrency(data.tongDTBanHang)}
            </td>
            <td className="border border-zinc-800 p-3 text-right text-purple-700">
              {formatCurrency(data.tongDTDichVu)}
            </td>
            <td className="border border-zinc-800 p-3 text-right text-primary text-lg">
              {formatCurrency(data.tongCong)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Summary Charts area (mental representation for printable) */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        <div className="border border-zinc-200 rounded-xl p-4 space-y-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cơ cấu doanh thu</p>
          <div className="space-y-1">
             <div className="flex justify-between items-center text-xs">
                <span>Bán hàng</span>
                <span className="font-bold">{((data.tongDTBanHang / (data.tongCong || 1)) * 100).toFixed(1)}%</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span>Dịch vụ</span>
                <span className="font-bold">{((data.tongDTDichVu / (data.tongCong || 1)) * 100).toFixed(1)}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="grid grid-cols-2 gap-10 mt-12 text-center text-[12px]">
        <div className="min-h-[120px] flex flex-col justify-between">
          <p className="font-bold uppercase italic">Giám đốc ký duyệt</p>
          <p className="text-[10px] text-zinc-400">(Ký và ghi rõ họ tên)</p>
        </div>
        <div className="min-h-[120px] flex flex-col justify-between">
          <p className="font-bold uppercase italic">Kế toán trưởng</p>
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

PrintableRevenueReport.displayName = "PrintableRevenueReport";
