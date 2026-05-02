import { getDonViTinhs } from "@/actions/don-vi-tinh.action";
import { Ruler, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Đơn Vị Tính – Aquamarine Jewelry & Luxury" };

export default async function DonViTinhPage() {
  let data: any[] = [];
  try {
    const res = await getDonViTinhs();
    if (res.success) data = res.data;
  } catch (e) {
    console.error(e);
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
              <Ruler className="w-6 h-6 text-primary" />
              Danh Mục Đơn Vị Tính
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-zinc-500 font-medium">Quy chuẩn đo lường hàng hóa trong hệ thống</p>
              <div className="flex items-center justify-center h-8 px-3 bg-primary/10 border border-primary/20 rounded-lg font-montserrat">
                <span className="text-[10px] font-bold text-primary/60 uppercase mr-2">Tổng:</span>
                <span className="text-sm font-black text-primary">{data.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left font-sans">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50 font-montserrat text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-5 font-bold text-center w-24">STT</th>
              <th className="px-6 py-5 font-bold">Mã DVT</th>
              <th className="px-6 py-5 font-bold">Tên đơn vị tính</th>
              <th className="px-6 py-5 font-bold text-center">Định lượng (Gram)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-zinc-400 italic">Chưa có dữ liệu đơn vị tính.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.maDVT} className="hover:bg-primary/[0.01] transition-colors">
                  <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 uppercase">{item.maDVT}</td>
                  <td className="px-6 py-4 font-bold text-zinc-800 uppercase tracking-tight">{item.tenDVT}</td>
                  <td className="px-6 py-4 text-center font-mono text-zinc-600">
                    {item.dinhLuong ? Number(item.dinhLuong).toFixed(4) : "-"}
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
          <p className="font-bold text-zinc-700">Quy định về Đơn vị tính:</p>
          <ul className="list-disc ml-4 space-y-1 mt-1">
            <li>Thông tin đơn vị tính chỉ được phép xem (Read-only).</li>
            <li>Định lượng (quy đổi ra Gram) là căn cứ quan trọng để tính toán tổng trọng lượng kho và giá trị quy đổi quốc tế.</li>
            <li>Mọi yêu cầu thêm hoặc điều chỉnh đơn vị đo lường mới cần được Quản lý phê duyệt và thực hiện.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}