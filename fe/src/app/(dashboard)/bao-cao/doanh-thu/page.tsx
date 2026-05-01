import { LineChart } from "lucide-react";

export const metadata = { title: "Báo Cáo Doanh Thu – Quản Lý Vàng Bạc Đá Quý" };

export default function DoanhThuPage() {
  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <LineChart className="w-6 h-6 text-primary" />
          Báo Cáo Doanh Thu
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Thống kê doanh thu bán hàng và dịch vụ theo tháng</p>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-12 text-center text-zinc-400">
        <LineChart className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
        <p className="font-medium">Chức năng đang phát triển</p>
        <p className="text-sm mt-1">Báo cáo doanh thu theo tháng</p>
      </div>
    </div>
  );
}
