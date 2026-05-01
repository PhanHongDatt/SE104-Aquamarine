import { FileText, Plus, Search } from "lucide-react";
import { getDanhSachPhieuDichVu } from "@/actions/service.action";

export const metadata = { title: "Phiếu dịch vụ – Admin | Quản Lý Vàng Bạc Đá Quý" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default async function AdminPhieuDichVuPage() {
  let data: any[] = [];
  try {
    data = await getDanhSachPhieuDichVu();
  } catch (e) {}

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Phiếu dịch vụ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý phiếu gia công và kiểm định</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/dich-vu/phieu-dich-vu/tao-moi"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Lập phiếu mới
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            Chưa có phiếu dịch vụ nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                  <th className="px-6 py-4">Số phiếu</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Ngày lập</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((phieu) => (
                  <tr key={phieu.soPhieu} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{phieu.soPhieu}</td>
                    <td className="px-6 py-4 font-medium text-zinc-800">{phieu.tenKhachHang}</td>
                    <td className="px-6 py-4">{new Date(phieu.ngayLap).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-900">{formatCurrency(Number(phieu.tongTien))}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        phieu.tinhTrang === "HoanThanh" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {phieu.tinhTrang === "HoanThanh" ? "Đã xong" : "Đang chờ"}
                      </span>
                    </td>
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
