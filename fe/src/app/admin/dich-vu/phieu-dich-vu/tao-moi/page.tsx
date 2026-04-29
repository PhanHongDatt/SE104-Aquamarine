import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Tạo phiếu dịch vụ – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default function AdminTaoPhieuDichVuPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <a
          href="/admin/dich-vu/phieu-dich-vu"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </a>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tạo phiếu dịch vụ</h1>
        <p className="text-sm text-zinc-500 mt-1">Nhập thông tin phiếu dịch vụ mới</p>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-zinc-500">Chức năng đang được phát triển</p>
      </div>
    </div>
  );
}
