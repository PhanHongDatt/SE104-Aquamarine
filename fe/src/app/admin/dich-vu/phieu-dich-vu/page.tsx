import { FileText } from "lucide-react";

export const metadata = { title: "Phiếu dịch vụ – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default function AdminPhieuDichVuPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Phiếu dịch vụ</h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý phiếu dịch vụ sửa chữa, chế tác</p>
        </div>
        <a
          href="/admin/dich-vu/phieu-dich-vu/tao-moi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          + Tạo phiếu dịch vụ
        </a>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-600">Chưa có phiếu dịch vụ nào</p>
        <p className="text-xs text-zinc-400">Chức năng đang được phát triển</p>
      </div>
    </div>
  );
}
