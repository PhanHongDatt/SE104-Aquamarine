import { getDanhSachNhaCungCap } from "@/actions/danh-muc";
import type { NhaCungCap } from "@/types/model";
import { Truck, ArrowLeft, Info, Phone, User, MapPin } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Nhà Cung Cấp – Aquamarine Jewelry & Luxury" };

export default async function NhaCungCapPage() {
  let suppliers: NhaCungCap[] = [];
  try {
    suppliers = await getDanhSachNhaCungCap();
  } catch (error) {
    console.error("LOAD NCC ERROR:", error);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/nhan-vien" 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-montserrat uppercase">
              <Truck className="w-6 h-6 text-primary" />
              Danh Mục Nhà Cung Cấp
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-zinc-500 font-medium">Tra cứu đối tác cung ứng vàng bạc, đá quý</p>
              <div className="flex items-center justify-center h-8 px-3 bg-primary/10 border border-primary/20 rounded-lg font-montserrat">
                <span className="text-[10px] font-bold text-primary/60 uppercase mr-2">Tổng:</span>
                <span className="text-sm font-black text-primary">{suppliers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left font-sans">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50 font-montserrat text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-5 font-bold text-center w-24">Mã NCC</th>
              <th className="px-6 py-5 font-bold">Tên Đối Tác</th>
              <th className="px-6 py-5 font-bold">Người Liên Hệ</th>
              <th className="px-6 py-5 font-bold">Thông Tin Liên Lạc</th>
              <th className="px-6 py-5 font-bold">Địa Chỉ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 italic">Chưa có dữ liệu nhà cung cấp.</td>
              </tr>
            ) : (
              suppliers.map((ncc) => (
                <tr key={ncc.maNCC} className="hover:bg-primary/[0.01] transition-colors group">
                  <td className="px-6 py-4 text-center font-mono text-xs text-zinc-400 uppercase">
                    {ncc.maNCC}
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-800">
                    {ncc.tenNCC}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium text-xs">{ncc.nguoiLienHe}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs">{ncc.soDienThoai}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 text-zinc-500 max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] leading-relaxed line-clamp-2">{ncc.diaChi}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-zinc-400 mt-0.5" />
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p className="font-bold text-zinc-700">Quy định về Nhà cung cấp:</p>
          <ul className="list-disc ml-4 space-y-1 mt-1">
            <li>Nhân viên chỉ có quyền tra cứu thông tin liên hệ để phục vụ việc giao nhận và kiểm kê hàng hóa.</li>
            <li>Theo quy định số 9 (QĐ9), chỉ vai trò Quản lý mới có quyền thêm mới hoặc cập nhật thông tin đối tác cung ứng.</li>
            <li>Vui lòng giữ bảo mật thông tin liên hệ của các đối tác chiến lược.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}