"use client";

import { getDonViTinhs } from "@/actions/don-vi-tinh.action";
import { ArrowLeft, Info, Ruler } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DonViTinhPage() {
  const [data, setData] = useState<any[]>([]);

  const loadData = async () => {
    const res = await getDonViTinhs();
    if (res.success) setData(res.data);
    else toast.error(res.message);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/nhan-vien" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-montserrat uppercase">
              <Ruler className="w-6 h-6 text-primary" />
              Danh Mục Đơn Vị Tính
            </h1>
            <p className="text-sm text-zinc-500 font-medium">Quy chuẩn đo lường hàng hóa trong hệ thống</p>
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
              <th className="px-6 py-5 font-bold">Sản phẩm áp dụng</th>
              <th className="px-6 py-5 font-bold">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 italic">Chưa có dữ liệu đơn vị tính.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.maDVT} className="hover:bg-primary/[0.01] transition-colors">
                  <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500 uppercase">{item.maDVT}</td>
                  <td className="px-6 py-4 font-bold text-zinc-800 uppercase tracking-tight">{item.tenDVT}</td>
                  <td className="px-6 py-4 text-zinc-600 max-w-[260px] whitespace-normal break-words">
                    {item.sanPhamApDung || "Chưa áp dụng"}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 max-w-[260px] whitespace-normal break-words">
                    {item.ghiChu || "-"}
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
          <p className="mt-1">Nhân viên chỉ được xem danh mục. Chỉ Quản lý mới được thêm, sửa hoặc xóa đơn vị tính.</p>
        </div>
      </div>
    </div>
  );
}
