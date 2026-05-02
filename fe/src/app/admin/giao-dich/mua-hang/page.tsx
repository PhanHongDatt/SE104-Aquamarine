import { Tag, Plus } from "lucide-react";
import { getDanhSachPhieuMuaHang } from "@/actions/giao-dich";
import { PurchaseInvoiceList } from "@/components/giao-dich/purchase-invoice-list";

export const metadata = { title: "Mua hàng – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminMuaHangPage() {
  let data = [];
  let error: string | null = null;

  try {
    const rawData = await getDanhSachPhieuMuaHang();
    data = JSON.parse(JSON.stringify(rawData));
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 cursor-default select-none">
            <Tag className="w-6 h-6 text-primary" />
            Phiếu mua hàng
          </h1>
          <p className="text-sm text-zinc-500 mt-1 cursor-default select-none">Quản lý các phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <a
          href="/admin/giao-dich/mua-hang/tao-moi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tạo phiếu mua
        </a>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          Lỗi kết nối cơ sở dữ liệu.
        </div>
      )}

      <PurchaseInvoiceList data={data} />
    </div>
  );
}
