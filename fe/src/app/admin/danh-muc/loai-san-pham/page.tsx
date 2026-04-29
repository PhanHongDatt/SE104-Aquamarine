import { Box } from "lucide-react";

export const metadata = { title: "Loại sản phẩm – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default function AdminLoaiSanPhamPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Loại sản phẩm</h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý loại sản phẩm và tỷ lệ lợi nhuận</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
          + Thêm loại
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <Box className="w-6 h-6 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-600">Chưa có loại sản phẩm nào</p>
        <p className="text-xs text-zinc-400">Chức năng đang được phát triển</p>
      </div>
    </div>
  );
}
