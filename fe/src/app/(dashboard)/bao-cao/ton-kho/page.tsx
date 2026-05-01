import { BarChart3 } from "lucide-react";

export const metadata = { title: "Báo Cáo Tồn Kho – Quản Lý Vàng Bạc Đá Quý" };

export default function TonKhoPage() {
  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Báo Cáo Tồn Kho
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Thống kê tồn kho theo tháng</p>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-12 text-center text-zinc-400">
        <BarChart3 className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
        <p className="font-medium">Chức năng đang phát triển</p>
        <p className="text-sm mt-1">Báo cáo tồn kho cuối tháng theo từng sản phẩm</p>
      </div>
    </div>
  );
}
