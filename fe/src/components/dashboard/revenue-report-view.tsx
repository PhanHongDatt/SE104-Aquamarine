"use client";

import { useState, useRef, useMemo } from "react";
import { Search, Printer, FileText, Download, Loader2, TrendingUp, ShoppingCart, Wrench, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBaoCaoDoanhThuDetailed, BaoCaoDoanhThuDetailedResult, BaoCaoDoanhThuItem, type ReportPeriodType } from "@/actions/bao-cao";
import { PrintableRevenueReport } from "./printable-revenue-report";
import { usePermissions } from "@/hooks/use-permissions";

function getTodayInputValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type RevenueTypeFilter = "all" | "sales" | "services";

interface FilterState {
  searchDay: string;
  revenueType: RevenueTypeFilter;
  minAmount: string;
}

export function RevenueReportView() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BaoCaoDoanhThuDetailedResult | null>(null);
  const [periodType, setPeriodType] = useState<ReportPeriodType>("month");
  const [selectedDay, setSelectedDay] = useState(getTodayInputValue);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ searchDay: "", revenueType: "all", minAmount: "" });

  const printRef = useRef<HTMLDivElement>(null);

  const canView = hasPermission("BC_DTH", "XEM");

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const hasActiveFilter = filters.searchDay !== "" || filters.revenueType !== "all" || filters.minAmount !== "";

  const filteredDailyData = useMemo(() => {
    if (!data) return [];
    let result = data.dailyData;

    if (filters.searchDay) {
      const q = filters.searchDay.trim();
      result = result.filter(item => {
        const dayStr = item.ngay.toString().padStart(2, "0");
        const monthStr = item.thang.toString().padStart(2, "0");
        return dayStr.includes(q) || monthStr.includes(q) || `${dayStr}/${monthStr}`.includes(q);
      });
    }

    if (filters.minAmount) {
      const min = Number(filters.minAmount);
      if (!isNaN(min) && min > 0) {
        result = result.filter(item => Number(item.tongDT) >= min);
      }
    }

    return result;
  }, [data, filters]);

  const filteredSummary = useMemo(() => {
    if (!data) return { tongDTBanHang: 0, tongDTDichVu: 0, tongCong: 0 };
    const tongDTBanHang = filters.revenueType === "services" ? 0 : filteredDailyData.reduce((sum, item) => sum + Number(item.dtBanHang), 0);
    const tongDTDichVu = filters.revenueType === "sales" ? 0 : filteredDailyData.reduce((sum, item) => sum + Number(item.dtDichVu), 0);
    return { tongDTBanHang, tongDTDichVu, tongCong: tongDTBanHang + tongDTDichVu };
  }, [filteredDailyData, data, filters.revenueType]);

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

  const handleFetchReport = async () => {
    try {
      setLoading(true);
      const res = await getBaoCaoDoanhThuDetailed(selectedMonth, selectedYear, periodType, selectedDay, selectedQuarter);
      setData(res);
      setHasSearched(true);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => setFilters({ searchDay: "", revenueType: "all", minAmount: "" });

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
          <title>BaoCaoDoanhThu_${data?.periodLabel || `${selectedMonth}_${selectedYear}`}</title>
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

  const showSalesCol = filters.revenueType === "all" || filters.revenueType === "sales";
  const showServiceCol = filters.revenueType === "all" || filters.revenueType === "services";

  return (
    <div className="space-y-6">
      {/* Selection Bar */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Kỳ báo cáo</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as ReportPeriodType)}
                className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="quarter">Theo quý</option>
              </select>
              {periodType === "day" && (
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => {
                    setSelectedDay(e.target.value);
                    const date = new Date(`${e.target.value}T00:00:00`);
                    if (!Number.isNaN(date.getTime())) {
                      setSelectedMonth(date.getMonth() + 1);
                      setSelectedYear(date.getFullYear());
                      setSelectedQuarter(Math.ceil((date.getMonth() + 1) / 3));
                    }
                  }}
                  className="md:col-span-3 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              )}
              {periodType === "month" && (
                <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
                </>
              )}
              {periodType === "quarter" && (
                <>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                    className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {quarters.map(q => <option key={q} value={q}>Quý {q}</option>)}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </>
              )}
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

      {/* Filter Bar */}
      {hasSearched && data && data.dailyData.length > 0 && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Bộ lọc</span>
              {hasActiveFilter && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {filteredDailyData.length}/{data.dailyData.length} ngày
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {hasActiveFilter && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-zinc-500 hover:text-zinc-700">
                  <X className="w-3 h-3" /> Xóa lọc
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowFilter(!showFilter)} className="h-8 gap-1">
                <Filter className="w-3 h-3" /> {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </Button>
            </div>
          </div>

          {showFilter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Tìm theo ngày</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="VD: 15, 06..."
                    value={filters.searchDay}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchDay: e.target.value }))}
                    className="w-full h-10 pl-9 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Loại doanh thu</label>
                <div className="flex gap-1 h-10">
                  {[
                    { value: "all" as const, label: "Tất cả" },
                    { value: "sales" as const, label: "Bán hàng" },
                    { value: "services" as const, label: "Dịch vụ" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilters(prev => ({ ...prev, revenueType: opt.value }))}
                      className={`flex-1 h-full rounded-xl text-sm font-medium transition-colors ${
                        filters.revenueType === opt.value
                          ? "bg-primary text-white shadow-sm"
                          : "bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Doanh thu tối thiểu</label>
                <input
                  type="number"
                  placeholder="Nhập số tiền..."
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Widgets */}
      {hasSearched && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showSalesCol && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 flex items-center gap-4 shadow-sm group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Doanh thu bán hàng</p>
                <p className="text-xl font-black text-zinc-900">{formatCurrency(filteredSummary.tongDTBanHang)}</p>
              </div>
            </div>
          )}
          {showServiceCol && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 flex items-center gap-4 shadow-sm group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Doanh thu dịch vụ</p>
                <p className="text-xl font-black text-zinc-900">{formatCurrency(filteredSummary.tongDTDichVu)}</p>
              </div>
            </div>
          )}
          <div className="bg-primary rounded-3xl p-6 flex items-center gap-4 shadow-lg shadow-primary/20 group overflow-hidden relative">
            <TrendingUp className="absolute -right-2 -bottom-2 w-24 h-24 text-white/10 -rotate-12" />
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white relative z-10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Tổng doanh thu kỳ</p>
              <p className="text-xl font-black text-white">{formatCurrency(filteredSummary.tongCong)}</p>
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
              Chi tiết doanh thu theo ngày - {data.periodLabel}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px]">
                  <th className="px-6 py-4 w-12 text-center">Ngày</th>
                  {showSalesCol && <th className="px-6 py-4 text-right">Doanh thu bán lẻ</th>}
                  {showServiceCol && <th className="px-6 py-4 text-right">Doanh thu dịch vụ</th>}
                  <th className="px-6 py-4 text-right">Tổng cộng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDailyData.length === 0 ? (
                  <tr>
                    <td colSpan={(showSalesCol ? 1 : 0) + (showServiceCol ? 1 : 0) + 2} className="px-6 py-24 text-center text-zinc-400 italic">
                      {data.dailyData.length === 0 ? "Không có dữ liệu giao dịch" : "Không có dữ liệu phù hợp bộ lọc"}
                    </td>
                  </tr>
                ) : (
                  filteredDailyData.map((item) => (
                    <tr key={`${item.nam}-${item.thang}-${item.ngay}`} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-zinc-500 font-mono font-bold">
                        {item.ngay.toString().padStart(2, '0')}/{item.thang.toString().padStart(2, '0')}
                      </td>
                      {showSalesCol && <td className="px-6 py-4 text-right font-medium text-blue-600">{formatCurrency(Number(item.dtBanHang))}</td>}
                      {showServiceCol && <td className="px-6 py-4 text-right font-medium text-purple-600">{formatCurrency(Number(item.dtDichVu))}</td>}
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
          {data && <PrintableRevenueReport data={data} thang={selectedMonth} nam={selectedYear} periodLabel={data.periodLabel} />}
        </div>
      </div>
    </div>
  );
}
