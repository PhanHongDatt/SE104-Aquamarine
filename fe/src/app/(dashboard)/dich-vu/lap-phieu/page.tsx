import { Wrench } from "lucide-react";

export const metadata = { title: "Lập Phiếu Dịch Vụ – Quản Lý Vàng Bạc Đá Quý" };

export default function LapPhieuDichVuPage() {
  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Lập Phiếu Dịch Vụ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Gia công và kiểm định trang sức</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + Lập phiếu mới
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-12 text-center text-zinc-400">
        <Wrench className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
        <p className="font-medium">Chức năng đang phát triển</p>
        <p className="text-sm mt-1">Lập phiếu dịch vụ gia công, kiểm định</p>
      </div>
    </div>
  );
}
