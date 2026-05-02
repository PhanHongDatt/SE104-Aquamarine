import { Tag, Plus, ArrowLeft } from "lucide-react";
import { getDanhSachPhieuBanHang } from "@/actions/giao-dich";
import { SalesInvoiceList } from "@/components/giao-dich/sales-invoice-list";
import Link from "next/link";

export const metadata = { title: "Phiếu bán hàng – Nhân viên | Aquamarine Jewelry & Luxury" };

export default async function StaffBanHangPage() {
  let data = [];
  let error: string | null = null;

  try {
    const rawData = await getDanhSachPhieuBanHang();
    data = JSON.parse(JSON.stringify(rawData));
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/nhan-vien" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 cursor-default select-none uppercase tracking-tight font-montserrat">
              <Tag className="w-6 h-6 text-primary" />
              Phiếu bán hàng
            </h1>
            <p className="text-sm text-zinc-500 mt-1 cursor-default select-none">Xem lịch sử các giao dịch bán hàng cho khách</p>
          </div>
        </div>
        <Link
          href="/nhan-vien/giao-dich/ban-hang/tao-moi"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Lập phiếu bán
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          Lỗi: {error}. Vui lòng liên hệ Quản lý kỹ thuật.
        </div>
      )}

      <SalesInvoiceList data={data} />
    </div>
  );
}