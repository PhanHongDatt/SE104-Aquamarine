import { Package, AlertTriangle } from "lucide-react";
import { getDanhSachSanPham } from "@/actions/danh-muc";
import { Badge } from "@/components/ui/badge";
import type { SanPham } from "@/types/model";

export const metadata = { title: "Sản phẩm – Admin | Quản Lý Vàng Bạc Đá Quý" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

const HAM_LUONG_LABEL: Record<string, string> = {
  K24: "9999 (K24)", K22: "Vàng K22", K18: "Vàng K18", K14: "Vàng K14", K10: "Vàng K10",
};

export default async function AdminSanPhamPage() {
  let sanPhams: SanPham[] = [];
  let error: string | null = null;

  try {
    sanPhams = await getDanhSachSanPham();
  } catch (e: any) {
    console.error("Error fetching san pham:", e);
    error = e.message;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tổng cộng <span className="font-semibold text-zinc-700">{sanPhams.length}</span> sản phẩm
          </p>
        </div>
        <a
          href="/admin/danh-muc/san-pham/tao-moi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          + Thêm sản phẩm
        </a>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          Lỗi kết nối cơ sở dữ liệu. Hãy đảm bảo Docker DB đang chạy.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {sanPhams.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">Chưa có sản phẩm nào</p>
            <p className="text-xs text-zinc-400">Hãy chạy lệnh "npx prisma db seed" để nạp dữ liệu mẫu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600 whitespace-nowrap">Mã SP</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600">Tên sản phẩm</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600 whitespace-nowrap">Loại SP</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-600 whitespace-nowrap">Hàm lượng</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-600 whitespace-nowrap">Tồn kho</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-600 whitespace-nowrap">Giá bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sanPhams.map((sp) => {
                  const isLowStock = sp.tonKho > 0 && sp.tonKho <= sp.tonToiThieu;
                  const isOutOfStock = sp.tonKho === 0;
                  return (
                    <tr key={sp.maSP} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{sp.maSP}</td>
                      <td className="px-4 py-3 font-medium text-zinc-800">{sp.tenSP}</td>
                      <td className="px-4 py-3 text-zinc-600">{sp.loaiSanPham?.tenLSP ?? sp.maLSP}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{HAM_LUONG_LABEL[sp.hamLuong] ?? sp.hamLuong}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-green-600"
                        }`}>
                          {(isLowStock || isOutOfStock) && <AlertTriangle className="w-3.5 h-3.5" />}
                          {sp.tonKho}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-800">{formatCurrency(Number(sp.donGiaBan))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
