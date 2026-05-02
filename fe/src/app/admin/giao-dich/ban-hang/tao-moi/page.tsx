import { prisma } from "@/lib/prisma";
import { SalesInvoiceForm } from "@/components/giao-dich/sales-invoice-form";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "Lập phiếu bán hàng – Admin | Aquamarine Jewelry & Luxury",
};

export default async function TaoPhieuBanHangPage() {
  // Fetch products and their categories/units for price calculation
  const products = await prisma.sanPham.findMany({
    include: {
      loaiSanPham: true,
      donViTinh: true,
    },
    orderBy: { maSP: 'asc' },
  });

  // Serialize to plain objects to avoid Decimal warnings
  const serializedProducts = JSON.parse(JSON.stringify(products));

  // Generate next Invoice ID: PBH + 7 digits
  const lastPhieu = await prisma.phieuBanHang.findFirst({
    orderBy: { soPhieu: 'desc' },
  });

  const lastNum = lastPhieu ? parseInt(lastPhieu.soPhieu.replace('PBH', '')) : 0;
  const nextSoPhieu = `PBH${(lastNum + 1).toString().padStart(7, '0')}`;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Lập phiếu bán hàng
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Tạo mới giao dịch bán hàng cho khách hàng</p>
        </div>
      </div>

      <SalesInvoiceForm products={serializedProducts} nextSoPhieu={nextSoPhieu} />
    </div>
  );
}
