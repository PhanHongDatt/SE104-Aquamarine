"use client";

import { useState, useRef } from "react";
import { Search, Printer, FileText, Download, Loader2, TrendingUp, ShoppingCart, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBaoCaoDoanhThuDetailed, BaoCaoDoanhThuDetailedResult } from "@/actions/bao-cao";
import { PrintableRevenueReport } from "./printable-revenue-report";
import { usePermissions } from "@/hooks/use-permissions";

export function RevenueReportView() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BaoCaoDoanhThuDetailedResult | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasSearched, setHasSearched] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Kiểm tra quyền BC_DTH:XEM từ phân quyền động
  const canView = hasPermission("BC_DTH", "XEM");

  if (!permLoading && !canView) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Từ chối truy cập</h2>
        <p className="text-zinc-500 mt-2 max-w-md mx-auto">
          Bạn không có quyền xem báo cáo doanh thu. Liên hệ Quản lý để được cấp quyền.
        </p>
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleFetchReport = async () => {
    try {
      setLoading(true);
      const res = await getBaoCaoDoanhThuDetailed(selectedMonth, selectedYear);
      setData(res);
      setHasSearched(true);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current || !data) return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    if (!pri) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    pri.document.open();
    pri.document.write(`
      <html>
        <head>
          <title>BaoCaoDoanhThu_${selectedMonth}_${selectedYear}</title>
          <base href="${window.location.origin}" />
          ${styles}
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; }
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
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 100);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    pri.document.close();
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-6">
      {/* Selection Bar */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Kỳ báo cáo</label>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="flex-1 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="flex-1 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleFetchReport} 
              disabled={loading}
              className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Lập báo cáo
            </Button>
            
            {hasSearched && data && (
              <>
                <Button variant="outline" onClick={handlePrint} className="rounded-2xl h-11 gap-2 border-zinc-200 hover:bg-zinc-50 font-bold">
                  <Printer className="w-4 h-4" /> In
                </Button>
                <Button variant="outline" onClick={handlePrint} className="rounded-2xl h-11 gap-2 bg-zinc-100 border-none hover:bg-zinc-200 font-bold text-zinc-600">
                  <Download className="w-4 h-4" /> In / lưu PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Widgets */}
      {hasSearched && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 flex items-center gap-4 shadow-sm group hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Doanh thu bán hàng</p>
              <p className="text-xl font-black text-zinc-900">{formatCurrency(data.tongDTBanHang)}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 flex items-center gap-4 shadow-sm group hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Doanh thu dịch vụ</p>
              <p className="text-xl font-black text-zinc-900">{formatCurrency(data.tongDTDichVu)}</p>
            </div>
          </div>
          <div className="bg-primary rounded-3xl p-6 flex items-center gap-4 shadow-lg shadow-primary/20 group overflow-hidden relative">
            <TrendingUp className="absolute -right-2 -bottom-2 w-24 h-24 text-white/10 -rotate-12" />
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white relative z-10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Tổng doanh thu tháng</p>
              <p className="text-xl font-black text-white">{formatCurrency(data.tongCong)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table */}
      {hasSearched && data && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Chi tiết doanh thu theo ngày
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px]">
                  <th className="px-6 py-4 w-12 text-center">Ngày</th>
                  <th className="px-6 py-4 text-right">Doanh thu bán lẻ</th>
                  <th className="px-6 py-4 text-right">Doanh thu dịch vụ</th>
                  <th className="px-6 py-4 text-right">Tổng cộng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.dailyData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center text-zinc-400 italic">
                      Không có dữ liệu giao dịch
                    </td>
                  </tr>
                ) : (
                  data.dailyData.map((item) => (
                    <tr key={item.ngay} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-zinc-500 font-mono font-bold">
                        {item.ngay.toString().padStart(2, '0')}/{selectedMonth}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-blue-600">{formatCurrency(Number(item.dtBanHang))}</td>
                      <td className="px-6 py-4 text-right font-medium text-purple-600">{formatCurrency(Number(item.dtDichVu))}</td>
                      <td className="px-6 py-4 text-right font-black text-zinc-900">{formatCurrency(Number(item.tongDT))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden printable area */}
      <div className="absolute -top-[9999px] -left-[9999px]">
        <div ref={printRef}>
          {data && <PrintableRevenueReport data={data} thang={selectedMonth} nam={selectedYear} />}
        </div>
      </div>
    </div>
  );
}
