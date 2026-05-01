import { Box, Plus } from "lucide-react";
import { getDanhSachLoaiSanPham } from "@/actions/danh-muc";
import type { LoaiSanPham } from "@/types/model";

export const metadata = { title: "Loại sản phẩm – Admin | Quản Lý Vàng Bạc Đá Quý" };

export default async function AdminLoaiSanPhamPage() {
  let data: LoaiSanPham[] = [];
  try {
    data = await getDanhSachLoaiSanPham();
  } catch (e) {}

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Box className="w-6 h-6 text-primary" />
            Loại sản phẩm
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý các nhóm hàng hóa (Vàng 18K, 24K, Đá quý...)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 italic">
            Chưa có loại sản phẩm nào.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60 font-semibold text-zinc-600">
                <th className="px-6 py-4">Mã loại</th>
                <th className="px-6 py-4">Tên loại</th>
                <th className="px-6 py-4">Đơn vị tính</th>
                <th className="px-6 py-4 text-right">% Lợi nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((item) => (
                <tr key={item.maLSP} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">{item.maLSP}</td>
                  <td className="px-6 py-4 font-medium text-zinc-800">{item.tenLSP}</td>
                  <td className="px-6 py-4 text-zinc-600">{item.donViTinh?.tenDVT || item.maDVT}</td>
                  <td className="px-6 py-4 text-right font-semibold text-primary">{item.phanTramLoiNhuan}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
