import { getDanhSachPhieuMuaHang } from "@/actions/giao-dich";
import { PurchaseInvoiceList } from "@/components/giao-dich/purchase-invoice-list";
import { Truck, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Phiếu mua hàng – Nhân viên | Aquamarine Jewelry & Luxury" };

export default async function StaffMuaHangPage() {
  const [rawData, rawProducts, rawSuppliers] = await Promise.all([
    getDanhSachPhieuMuaHang(),
    prisma.sanPham.findMany({
      where: { deletedAt: null },
      include: { loaiSanPham: true, donViTinh: true },
      orderBy: { maSP: "asc" },
    }),
    prisma.nhaCungCap.findMany({
      where: { deletedAt: null },
      orderBy: { maNCC: "asc" },
    }),
  ]);
  const data = JSON.parse(JSON.stringify(rawData));
  const products = JSON.parse(JSON.stringify(rawProducts));
  const suppliers = JSON.parse(JSON.stringify(rawSuppliers));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/nhan-vien" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight font-montserrat">
              <Truck className="w-6 h-6 text-primary" />
              Phiếu mua hàng
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Lịch sử nhập kho hàng hóa từ nhà cung cấp</p>
          </div>
        </div>
        <Link
          href="/nhan-vien/giao-dich/mua-hang/tao-moi"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Lập phiếu mua
        </Link>
      </div>

      <PurchaseInvoiceList data={data} products={products} suppliers={suppliers} returnUrl="/nhan-vien/giao-dich/mua-hang" />
    </div>
  );
}
