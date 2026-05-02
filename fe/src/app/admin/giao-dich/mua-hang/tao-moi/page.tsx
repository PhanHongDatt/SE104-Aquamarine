import { prisma } from "@/lib/prisma";
import { PurchaseInvoiceForm } from "@/components/giao-dich/purchase-invoice-form";
import { Truck } from "lucide-react";

export const metadata = {
  title: "Lập phiếu mua hàng – Admin | Aquamarine Jewelry & Luxury",
};

export default async function TaoPhieuMuaHangPage() {
  const productsRaw = await prisma.sanPham.findMany({
    include: { loaiSanPham: true, donViTinh: true },
    orderBy: { maSP: 'asc' },
  });
  const products = JSON.parse(JSON.stringify(productsRaw));

  const suppliersRaw = await prisma.nhaCungCap.findMany({
    orderBy: { maNCC: 'asc' },
  });
  const suppliers = JSON.parse(JSON.stringify(suppliersRaw));

  const lastPhieu = await prisma.phieuMuaHang.findFirst({
    orderBy: { soPhieu: 'desc' },
  });

  const lastNum = lastPhieu ? parseInt(lastPhieu.soPhieu.replace('PMH', '')) : 0;
  const nextSoPhieu = `PMH${(lastNum + 1).toString().padStart(7, '0')}`;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 cursor-default select-none">
            <Truck className="w-6 h-6 text-primary" />
            Lập phiếu mua hàng
          </h1>
          <p className="text-sm text-zinc-500 mt-1 cursor-default select-none">Tạo mới giao dịch nhập hàng từ nhà cung cấp</p>
        </div>
      </div>

      <PurchaseInvoiceForm products={products} suppliers={suppliers} nextSoPhieu={nextSoPhieu} />
    </div>
  );
}
