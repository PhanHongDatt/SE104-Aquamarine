"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Search, Printer, FileText, AlertTriangle, Download, Loader2, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBaoCaoTonKhoDetailed, BaoCaoTonKhoDetailedItem, type ReportPeriodType } from "@/actions/bao-cao";
import { PrintableInventoryReport } from "./printable-inventory-report";
import { getLoaiSanPhams } from "@/actions/loai-san-pham.action";

function getTodayInputValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const HAM_LUONG_OPTIONS = [
  { value: "", label: "Tất cả hàm lượng" },
  { value: "K24", label: "24K" },
  { value: "K22", label: "22K" },
  { value: "K18", label: "18K" },
  { value: "K14", label: "14K" },
  { value: "K10", label: "10K" },
];

interface FilterState {
  search: string;
  maLSP: string;
  hamLuong: string;
  chiTonThap: boolean;
}

export function InventoryReportView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BaoCaoTonKhoDetailedItem[]>([]);
  const [periodType, setPeriodType] = useState<ReportPeriodType>("month");
  const [selectedDay, setSelectedDay] = useState(getTodayInputValue);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [loaiSanPhams, setLoaiSanPhams] = useState<{ maLSP: string; tenLSP: string }[]>([]);
  const [filters, setFilters] = useState<FilterState>({ search: "", maLSP: "", hamLuong: "", chiTonThap: false });

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLoaiSanPhams()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setLoaiSanPhams(res.data.map((lsp: any) => ({ maLSP: lsp.maLSP, tenLSP: lsp.tenLSP })));
        }
      })
      .catch(() => {});
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const periodLabel =
    periodType === "day"
      ? `Ngày ${new Date(`${selectedDay}T00:00:00`).toLocaleDateString("vi-VN")}`
      : periodType === "quarter"
        ? `Quý ${selectedQuarter} Năm ${selectedYear}`
        : `Tháng ${selectedMonth} Năm ${selectedYear}`;

  const hasActiveFilter = filters.search !== "" || filters.maLSP !== "" || filters.hamLuong !== "" || filters.chiTonThap;

  const filteredData = useMemo(() => {
    let result = data;
    if (filters.search) {
      const q = removeAccents(filters.search);
      result = result.filter(item => removeAccents(item.tenSP).includes(q) || item.maSP.toLowerCase().includes(q));
    }
    if (filters.maLSP) {
      result = result.filter(item => item.maLSP === filters.maLSP);
    }
    if (filters.hamLuong) {
      result = result.filter(item => item.hamLuong === filters.hamLuong);
    }
    if (filters.chiTonThap) {
      result = result.filter(item => item.canhBao);
    }
    return result;
  }, [data, filters]);

  const handleFetchReport = async () => {
    try {
      setLoading(true);
      const res = await getBaoCaoTonKhoDetailed(selectedMonth, selectedYear, periodType, selectedDay, selectedQuarter);
      setData(res);
      setHasSearched(true);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => setFilters({ search: "", maLSP: "", hamLuong: "", chiTonThap: false });

  const handlePrint = () => {
    if (!printRef.current) return;

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
          <title>BaoCaoTonKho_${periodLabel}</title>
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

  return (
    <div className="space-y-6">
      {/* Search Bar */}
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Xem báo cáo
            </Button>

            {hasSearched && data.length > 0 && (
              <>
                <Button variant="outline" onClick={handlePrint} className="rounded-2xl h-11 gap-2 border-zinc-200 hover:bg-zinc-50 font-bold">
                  <Printer className="w-4 h-4" /> In báo cáo
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
      {hasSearched && data.length > 0 && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Bộ lọc</span>
              {hasActiveFilter && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {filteredData.length}/{data.length} sản phẩm
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Tên hoặc mã sản phẩm..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full h-10 pl-9 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Loại sản phẩm</label>
                <select
                  value={filters.maLSP}
                  onChange={(e) => setFilters(prev => ({ ...prev, maLSP: e.target.value }))}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Tất cả loại</option>
                  {loaiSanPhams.map(lsp => (
                    <option key={lsp.maLSP} value={lsp.maLSP}>{lsp.tenLSP}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Hàm lượng</label>
                <select
                  value={filters.hamLuong}
                  onChange={(e) => setFilters(prev => ({ ...prev, hamLuong: e.target.value }))}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {HAM_LUONG_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Trạng thái tồn</label>
                <label className="flex items-center gap-2 h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.chiTonThap}
                    onChange={(e) => setFilters(prev => ({ ...prev, chiTonThap: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-zinc-700">Chỉ hiện tồn thấp</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Kết quả tồn kho - {periodLabel}
            </h2>
            {filteredData.some(item => item.canhBao) && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
                <span className="text-[10px] font-bold text-red-500 uppercase">Cảnh báo tồn thấp ({filteredData.filter(item => item.canhBao).length} sản phẩm)</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px]">
                  <th className="px-6 py-4 w-12 text-center">STT</th>
                  <th className="px-6 py-4 min-w-[200px]">Sản phẩm</th>
                  <th className="px-6 py-4 text-right">Tồn đầu</th>
                  <th className="px-6 py-4 text-right">Mua vào</th>
                  <th className="px-6 py-4 text-right">Bán ra</th>
                  <th className="px-6 py-4 text-right">Tồn cuối</th>
                  <th className="px-6 py-4 text-right">Tối thiểu</th>
                  <th className="px-6 py-4 text-center">ĐVT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-24 text-center text-zinc-400 italic">
                      {data.length === 0 ? "Không có dữ liệu cho kỳ này" : "Không có sản phẩm phù hợp bộ lọc"}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.maSP} className={`group transition-colors ${item.canhBao ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-zinc-50/50'}`}>
                      <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 flex items-center gap-2">
                            {item.tenSP}
                            {item.canhBao && (
                              <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{item.maSP}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{item.tonDau}</td>
                      <td className="px-6 py-4 text-right text-blue-600 font-bold">{item.slMuaVao}</td>
                      <td className="px-6 py-4 text-right text-orange-600 font-bold">{item.slBanRa}</td>
                      <td className={`px-6 py-4 text-right font-black text-base ${item.canhBao ? 'text-red-600' : 'text-zinc-900'}`}>
                        {item.tonCuoi}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-400 italic text-xs">{item.tonToiThieu}</td>
                      <td className="px-6 py-4 text-center text-zinc-600">{item.tenDVT}</td>
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
          <PrintableInventoryReport data={filteredData} thang={selectedMonth} nam={selectedYear} periodLabel={periodLabel} />
        </div>
      </div>
    </div>
  );
}
