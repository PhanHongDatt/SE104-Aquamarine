import { Settings } from "lucide-react";

export const metadata = { title: "Quy định – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default function AdminQuyDinhPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Quy định</h1>
        <p className="text-sm text-zinc-500 mt-1">Thay đổi các quy định hệ thống (QĐ11)</p>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <Settings className="w-6 h-6 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-600">Cấu hình quy định hệ thống</p>
        <p className="text-xs text-zinc-400">Chức năng đang được phát triển</p>
      </div>
    </div>
  );
}
