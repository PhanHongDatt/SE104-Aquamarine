import { getDanhSachSanPham } from "@/actions/danh-muc";
import type { SanPham } from "@/types/model";
import { Package, ArrowLeft, Search, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Sản Phẩm – Aquamarine Jewelry & Luxury" };

const HAM_LUONG_STYLE: Record<string, string> = {
  K24: "bg-amber-100 text-amber-700 border-amber-200",
  K22: "bg-orange-100 text-orange-700 border-orange-200",
  K18: "bg-yellow-50 text-yellow-700 border-yellow-200",
  K14: "bg-slate-100 text-slate-700 border-slate-200",
  K10: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default async function SanPhamPage() {
  let sanPhams: SanPham[] = [];
  let error: string | null = null;
  
  try {
    sanPhams = await getDanhSachSanPham();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/nhan-vien" 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-montserrat uppercase">
              <Package className="w-6 h-6 text-primary" />
              Danh Mục Sản Phẩm
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-zinc-500 font-medium">Tra cứu thông tin hàng hóa và giá bán</p>
              <div className="flex items-center justify-center h-8 px-3 bg-primary/10 border border-primary/20 rounded-lg font-montserrat">
                <span className="text-[10px] font-bold text-primary/60 uppercase mr-2">Tổng:</span>
                <span className="text-sm font-black text-primary">{sanPhams.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          Lỗi: {error}. Vui lòng kiểm tra kết nối Database.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {sanPhams.length === 0 && !error ? (
            <div className="p-20 text-center text-zinc-400 italic flex flex-col items-center gap-3">
              <Search className="w-8 h-8 opacity-20" />
              <p>Chưa có dữ liệu sản phẩm trong hệ thống.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left font-sans">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 font-montserrat text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-5 font-bold text-center w-16">STT</th>
                  <th className="px-6 py-5 font-bold">Mã & Tên Sản Phẩm</th>
                  <th className="px-6 py-4 font-bold">Loại SP</th>
                  <th className="px-6 py-4 font-bold text-center">Hàm lượng</th>
                  <th className="px-6 py-4 font-bold text-right">Tồn kho</th>
                  <th className="px-6 py-4 font-bold text-right text-primary">Giá Bán Niêm Yết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sanPhams.map((item, index) => (
                  <tr key={item.maSP} className="hover:bg-primary/[0.01] transition-colors group">
                    <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase leading-none mb-1">{item.maSP}</span>
                        <span className="font-bold text-zinc-800 text-sm">{item.tenSP}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-bold border border-zinc-200">
                        {item.loaiSanPham?.tenLSP}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase font-montserrat", HAM_LUONG_STYLE[item.hamLuong] || "bg-zinc-100")}>
                        {item.hamLuong}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn("font-bold text-sm", item.tonKho === 0 ? "text-red-600" : item.tonKho <= item.tonToiThieu ? "text-amber-500" : "text-green-600")}>
                          {item.tonKho} {item.donViTinh?.tenDVT}
                        </span>
                        {item.tonKho <= item.tonToiThieu && (
                          <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter mt-0.5">Sắp hết hàng</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-primary font-montserrat text-sm tracking-tight">
                        {formatCurrency(Number(item.donGiaBan))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-zinc-400 mt-0.5" />
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p className="font-bold text-zinc-700">Lưu ý cho Nhân viên:</p>
          <ul className="list-disc ml-4 space-y-1 mt-1">
            <li>Thông tin sản phẩm chỉ được phép xem (Read-only). Vui lòng liên hệ Quản lý nếu cần thay đổi giá hoặc định mức tồn.</li>
            <li>Giá bán đã bao gồm thuế và phí gia công niêm yết của cửa hàng.</li>
            <li>Cảnh báo tồn kho thấp (màu đỏ/vàng) dùng để nhắc nhở tư vấn nhập thêm hàng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
