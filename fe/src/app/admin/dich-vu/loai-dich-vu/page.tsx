import { ListChecks, Plus } from "lucide-react";
import { getDanhSachLoaiDichVu } from "@/actions/service.action";

export const metadata = { title: "Loại dịch vụ – Admin | Quản Lý Vàng Bạc Đá Quý" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default async function AdminLoaiDichVuPage() {
  let data: any[] = [];
  try {
    data = await getDanhSachLoaiDichVu();
  } catch (e) {}

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" />
            Danh mục loại dịch vụ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý bảng giá các loại dịch vụ vàng bạc</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            Chưa có loại dịch vụ nào.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                <th className="px-6 py-4">Mã DV</th>
                <th className="px-6 py-4">Tên dịch vụ</th>
                <th className="px-6 py-4">Nhóm</th>
                <th className="px-6 py-4 text-right">Đơn giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((item) => (
                <tr key={item.maDV} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maDV}</td>
                  <td className="px-6 py-4 font-medium text-zinc-800">{item.tenDV}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] uppercase font-bold">
                      {item.nhomDV}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-900">{formatCurrency(Number(item.donGiaDV))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
