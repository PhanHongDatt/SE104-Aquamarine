"use client";

import { useState, useMemo } from "react";
import { Search, Eye, Filter, Calendar, User, FileText, CheckCircle2, Clock, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ServiceSearchListProps {
  initialData: any[];
  isAdmin?: boolean;
}

export function ServiceSearchList({ initialData, isAdmin = false }: ServiceSearchListProps) {
  const [filters, setFilters] = useState({
    soPhieu: "",
    tenKhachHang: "",
    tinhTrang: "ALL", // ALL, HoanThanh, ChuaHoanThanh
    tuNgay: "",
    denNgay: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const filteredData = useMemo(() => {
    return initialData.filter((phieu) => {
      const searchTerm = removeAccents(filters.soPhieu); // Both soPhieu and tenKhachHang are linked to this in UI
      const phieuSo = removeAccents(phieu.soPhieu);
      const phieuTen = removeAccents(phieu.tenKhachHang);

      const matchMain = !searchTerm || phieuSo.includes(searchTerm) || phieuTen.includes(searchTerm);
      const matchTinhTrang = filters.tinhTrang === "ALL" || phieu.tinhTrang === filters.tinhTrang;
      
      let matchNgay = true;
      if (filters.tuNgay || filters.denNgay) {
        const ngayLap = new Date(phieu.ngayLap);
        ngayLap.setHours(0, 0, 0, 0);
        
        if (filters.tuNgay) {
          const tu = new Date(filters.tuNgay);
          tu.setHours(0, 0, 0, 0);
          if (ngayLap < tu) matchNgay = false;
        }
        if (filters.denNgay) {
          const den = new Date(filters.denNgay);
          den.setHours(0, 0, 0, 0);
          if (ngayLap > den) matchNgay = false;
        }
      }

      return matchMain && matchTinhTrang && matchNgay;
    });
  }, [initialData, filters]);

  const resetFilters = () => {
    setFilters({
      soPhieu: "",
      tenKhachHang: "",
      tinhTrang: "ALL",
      tuNgay: "",
      denNgay: "",
    });
  };

  const detailUrl = isAdmin ? "/admin/dich-vu/phieu-dich-vu" : "/nhan-vien/dich-vu/tra-cuu";

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              id="service-receipt-search"
              name="serviceReceiptSearch"
              type="text"
              placeholder="Tìm theo số phiếu hoặc tên khách hàng..."
              value={filters.soPhieu || filters.tenKhachHang}
              onChange={(e) => setFilters(prev => ({ ...prev, soPhieu: e.target.value, tenKhachHang: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-2xl gap-2 h-11 ${showFilters ? 'bg-zinc-100' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Lọc nâng cao
            </Button>
            {(filters.soPhieu || filters.tenKhachHang || filters.tinhTrang !== "ALL" || filters.tuNgay || filters.denNgay) && (
              <Button variant="ghost" onClick={resetFilters} className="rounded-2xl h-11 text-zinc-500">
                <X className="w-4 h-4 mr-2" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <label htmlFor="service-status-filter" className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Tình trạng phiếu</label>
              <select
                id="service-status-filter"
                name="serviceStatusFilter"
                value={filters.tinhTrang}
                onChange={(e) => setFilters(prev => ({ ...prev, tinhTrang: e.target.value }))}
                className="w-full h-10 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="HoanThanh">Đã hoàn thành</option>
                <option value="ChuaHoanThanh">Chưa hoàn thành</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="service-from-date-filter" className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Từ ngày</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="service-from-date-filter"
                  name="serviceFromDateFilter"
                  type="date"
                  value={filters.tuNgay}
                  onChange={(e) => setFilters(prev => ({ ...prev, tuNgay: e.target.value }))}
                  className="w-full pl-10 pr-3 h-10 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="service-to-date-filter" className="text-[10px] font-bold text-zinc-400 uppercase ml-1">Đến ngày</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="service-to-date-filter"
                  name="serviceToDateFilter"
                  type="date"
                  value={filters.denNgay}
                  onChange={(e) => setFilters(prev => ({ ...prev, denNgay: e.target.value }))}
                  className="w-full pl-10 pr-3 h-10 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 font-bold text-zinc-600 uppercase tracking-tighter text-[11px]">
	                <th className="px-6 py-4 w-12 text-center">STT</th>
	                <th className="px-6 py-4">Số phiếu</th>
                <th className="px-6 py-4">Ngày lập</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-right">Tổng tiền</th>
                <th className="px-6 py-4 text-right">Trả trước</th>
                <th className="px-6 py-4 text-right">Còn lại</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
	                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-24 text-center text-zinc-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-10 h-10 text-zinc-200" />
                      <p>Không tìm thấy phiếu dịch vụ nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
	                filteredData.map((phieu, index) => (
	                  <tr key={phieu.soPhieu} className="group hover:bg-zinc-50/50 transition-colors">
	                    <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
	                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {phieu.soPhieu}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {new Date(phieu.ngayLap).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-zinc-300" />
                        <span className="font-bold text-zinc-900">{phieu.tenKhachHang}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-zinc-900">
                      {formatCurrency(Number(phieu.tongTien))}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-medium italic">
                      {formatCurrency(Number(phieu.tongTraTruoc))}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {formatCurrency(Number(phieu.tongConLai))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          phieu.tinhTrang === "HoanThanh" 
                          ? "bg-green-50 text-green-600 border border-green-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {phieu.tinhTrang === "HoanThanh" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
	                              Hoàn thành
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
	                              Chưa hoàn thành
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`${detailUrl}/${phieu.soPhieu}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all duration-200 font-bold text-xs border border-primary/10 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
