import { ShoppingCart, AlertTriangle, Plus } from "lucide-react";
import { getDanhSachPhieuMuaHang } from "@/actions/giao-dich";
import type { PhieuMuaHang } from "@/types/model";

export const metadata = { title: "Mua hàng – Admin | Quản Lý Vàng Bạc Đá Quý" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default async function AdminMuaHangPage() {
  let data: PhieuMuaHang[] = [];
  let error: string | null = null;

  try {
    data = await getDanhSachPhieuMuaHang();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Phiếu mua hàng
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý các phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <a
          href="/admin/giao-dich/mua-hang/tao-moi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tạo phiếu mua
        </a>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra Docker.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            Chưa có phiếu mua hàng nào được lập.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                  <th className="px-6 py-4">Số phiếu</th>
                  <th className="px-6 py-4">Ngày lập</th>
                  <th className="px-6 py-4">Nhà cung cấp</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((phieu) => (
                  <tr key={phieu.soPhieu} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{phieu.soPhieu}</td>
                    <td className="px-6 py-4">{new Date(phieu.ngayLap).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4 font-medium text-zinc-800">{phieu.nhaCungCap?.tenNCC || phieu.maNCC}</td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-900">{formatCurrency(Number(phieu.tongTien))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
