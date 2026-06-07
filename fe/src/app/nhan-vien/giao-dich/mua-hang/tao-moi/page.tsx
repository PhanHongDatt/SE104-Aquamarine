import { prisma } from "@/lib/prisma";
import { PurchaseInvoiceForm } from "@/components/giao-dich/purchase-invoice-form";
import { Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { nextSequentialIdFromValidCodes } from "@/lib/id-generation";

export const metadata = {
  title: "Lập phiếu mua hàng – Nhân viên | Aquamarine Jewelry & Luxury",
};

export default async function StaffTaoPhieuMuaHangPage() {
  const [productsRaw, suppliersRaw, existingReceipts] = await Promise.all([
    prisma.sanPham.findMany({
      where: { deletedAt: null },
      include: { loaiSanPham: true, donViTinh: true },
      orderBy: { maSP: 'asc' },
    }),
    prisma.nhaCungCap.findMany({
      orderBy: { maNCC: 'asc' },
    }),
    prisma.phieuMuaHang.findMany({
      where: { soPhieu: { startsWith: "PMH" } },
      select: { soPhieu: true },
    }),
  ]);
  const products = JSON.parse(JSON.stringify(productsRaw));
  const suppliers = JSON.parse(JSON.stringify(suppliersRaw));
  const nextSoPhieu = nextSequentialIdFromValidCodes(existingReceipts.map((receipt) => receipt.soPhieu), "PMH", 7);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/nhan-vien/giao-dich/mua-hang" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight font-montserrat">
              <Truck className="w-6 h-6 text-primary" />
              Lập phiếu mua hàng
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Tạo mới giao dịch nhập hàng từ nhà cung cấp</p>
          </div>
        </div>
      </div>

      <PurchaseInvoiceForm
        products={products}
        suppliers={suppliers}
        nextSoPhieu={nextSoPhieu}
      />
    </div>
  );
}
