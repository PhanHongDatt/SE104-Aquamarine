import { Truck, Plus } from "lucide-react";
import { getDanhSachNhaCungCap } from "@/actions/danh-muc";
import type { NhaCungCap } from "@/types/model";

export const metadata = { title: "Nhà cung cấp – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default async function AdminNhaCungCapPage() {
  let data: NhaCungCap[] = [];
  try {
    data = await getDanhSachNhaCungCap();
  } catch (e) {}

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Nhà cung cấp
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Danh sách các đối tác cung ứng vàng bạc đá quý</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            Chưa có dữ liệu nhà cung cấp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                  <th className="px-6 py-4">Mã NCC</th>
                  <th className="px-6 py-4">Tên đối tác</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.map((item) => (
                  <tr key={item.maNCC} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maNCC}</td>
                    <td className="px-6 py-4 font-medium text-zinc-800">{item.tenNCC}</td>
                    <td className="px-6 py-4 text-zinc-600">{item.soDienThoai}</td>
                    <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">{item.diaChi}</td>
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
