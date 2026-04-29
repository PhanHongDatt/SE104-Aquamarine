import { ShoppingCart } from "lucide-react";

export const metadata = { title: "Mua hàng – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default function AdminMuaHangPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Phiếu mua hàng</h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý các phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <a
          href="/admin/giao-dich/mua-hang/tao-moi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          + Tạo phiếu mua
        </a>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-600">Chưa có phiếu mua hàng nào</p>
        <p className="text-xs text-zinc-400">Chức năng đang được phát triển</p>
      </div>
    </div>
  );
}
