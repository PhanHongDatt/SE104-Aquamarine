import { getDanhSachLoaiSanPham } from "@/actions/danh-muc";
import type { LoaiSanPham } from "@/types/model";
import { Tag, ArrowLeft, Info, Ruler } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Loại Sản Phẩm – Aquamarine Jewelry & Luxury",
};

export default async function LoaiSanPhamPage() {
  let loaiSanPhams: LoaiSanPham[] = [];

  try {
    const data = await getDanhSachLoaiSanPham();
    if (Array.isArray(data)) {
      loaiSanPhams = data;
    }
  } catch (error) {
    console.error("LOAD LSP ERROR:", error);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* HEADER */}
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
              <Tag className="w-6 h-6 text-primary" />
              Danh Mục Loại Sản Phẩm
            </h1>

            <div className="flex items-center gap-4">
              <p className="text-sm text-zinc-500 font-medium">Phân loại hàng hóa và định mức lợi nhuận</p>
              <div className="flex items-center justify-center h-8 px-3 bg-primary/10 border border-primary/20 rounded-lg font-montserrat">
                <span className="text-[10px] font-bold text-primary/60 uppercase mr-2">Tổng:</span>
                <span className="text-sm font-black text-primary">{loaiSanPhams.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left font-sans">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 font-montserrat text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-5 font-bold text-center w-24">Mã Loại</th>
                <th className="px-6 py-5 font-bold">Tên loại sản phẩm</th>
                <th className="px-6 py-4 font-bold text-center">ĐVT Mặc định</th>
                <th className="px-6 py-4 font-bold text-right text-primary">Lợi nhuận (%)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {loaiSanPhams.map((lsp) => (
                <tr
                  key={lsp.maLSP}
                  className="hover:bg-primary/[0.01] transition-colors group"
                >
                  <td className="px-6 py-4 text-center font-mono text-xs text-zinc-400">
                    {lsp.maLSP}
                  </td>

                  <td className="px-6 py-4 font-bold text-zinc-800">
                    {lsp.tenLSP}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold border border-zinc-200 uppercase tracking-tighter">
                      <Ruler className="w-3 h-3" />
                      {lsp.donViTinh?.tenDVT ?? lsp.maDVT}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-primary font-montserrat">
                      {Number(lsp.phanTramLoiNhuan || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPTY STATE */}
      {loaiSanPhams.length === 0 && (
        <div className="p-20 text-center text-zinc-400 italic flex flex-col items-center gap-3">
          <Tag className="w-8 h-8 opacity-20" />
          <p>Không có dữ liệu loại sản phẩm.</p>
        </div>
      )}

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-zinc-400 mt-0.5" />
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p className="font-bold text-zinc-700">Quy định về Loại sản phẩm:</p>
          <ul className="list-disc ml-4 space-y-1 mt-1">
            <li>Nhân viên chỉ có quyền xem danh mục. Việc thêm mới hoặc thay đổi % lợi nhuận thuộc thẩm quyền của Quản lý.</li>
            <li>% Lợi nhuận là căn cứ để hệ thống tự động tính giá bán từ giá nhập kho.</li>
            <li>Mỗi loại sản phẩm gắn liền với một đơn vị tính chuẩn để đồng bộ báo cáo kho.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}