import { Search } from "lucide-react";

export const metadata = { title: "Tra Cứu Dịch Vụ – Quản Lý Vàng Bạc Đá Quý" };

export default function TraCuuDichVuPage() {
  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Tra Cứu Dịch Vụ
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Tìm kiếm và xem trạng thái phiếu dịch vụ</p>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-12 text-center text-zinc-400">
        <Search className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
        <p className="font-medium">Chức năng đang phát triển</p>
        <p className="text-sm mt-1">Tra cứu trạng thái phiếu dịch vụ khách hàng</p>
      </div>
    </div>
  );
}
