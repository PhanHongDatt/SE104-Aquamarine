"use client";

import { useState, useRef } from "react";
import { Search, Printer, FileText, Calendar, AlertTriangle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBaoCaoTonKhoDetailed, BaoCaoTonKhoDetailedItem } from "@/actions/bao-cao";
import { PrintableInventoryReport } from "./printable-inventory-report";

export function InventoryReportView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BaoCaoTonKhoDetailedItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasSearched, setHasSearched] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleFetchReport = async () => {
    try {
      setLoading(true);
      const res = await getBaoCaoTonKhoDetailed(selectedMonth, selectedYear);
      setData(res);
      setHasSearched(true);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

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
          <title>BaoCaoTonKho_${selectedMonth}_${selectedYear}</title>
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
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Tháng báo cáo</label>
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Xem báo cáo
            </Button>
            
            {hasSearched && data.length > 0 && (
              <>
                <Button variant="outline" onClick={handlePrint} className="rounded-2xl h-11 gap-2 border-zinc-200 hover:bg-zinc-50 font-bold">
                  <Printer className="w-4 h-4" /> In báo cáo
                </Button>
                <Button variant="outline" onClick={handlePrint} className="rounded-2xl h-11 gap-2 bg-zinc-100 border-none hover:bg-zinc-200 font-bold text-zinc-600">
                  <Download className="w-4 h-4" /> Xuất PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Kết quả tồn kho Tháng {selectedMonth}/{selectedYear}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Cảnh báo tồn thấp</span>
            </div>
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
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-24 text-center text-zinc-400 italic">
                      Không có dữ liệu cho tháng này
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
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
          <PrintableInventoryReport data={data} thang={selectedMonth} nam={selectedYear} />
        </div>
      </div>
    </div>
  );
}
