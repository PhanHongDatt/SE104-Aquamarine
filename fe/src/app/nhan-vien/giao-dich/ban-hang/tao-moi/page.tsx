import { prisma } from "@/lib/prisma";
import { SalesInvoiceForm } from "@/components/giao-dich/sales-invoice-form";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { nextSequentialIdFromValidCodes } from "@/lib/id-generation";

export const metadata = {
  title: "Lập phiếu bán hàng – Nhân viên | Aquamarine Jewelry & Luxury",
};

export default async function StaffTaoPhieuBanHangPage() {
  // Fetch products and their categories/units for price calculation
  const [products, customers] = await Promise.all([
    prisma.sanPham.findMany({
      where: { deletedAt: null },
      include: {
        loaiSanPham: true,
        donViTinh: true,
      },
      orderBy: { maSP: 'asc' },
    }),
    prisma.khachHang.findMany({
      where: { deletedAt: null },
      orderBy: { maKH: 'asc' },
    }),
  ]);

  // Serialize to plain objects to avoid Decimal warnings
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCustomers = JSON.parse(JSON.stringify(customers));

  // Generate next Invoice ID: PBH + 7 digits
  const existingReceipts = await prisma.phieuBanHang.findMany({
    where: { soPhieu: { startsWith: "PBH" } },
    select: { soPhieu: true },
  });

  const nextSoPhieu = nextSequentialIdFromValidCodes(existingReceipts.map((receipt) => receipt.soPhieu), "PBH", 7);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/nhan-vien/giao-dich/ban-hang" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight font-montserrat">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Lập phiếu bán hàng
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Tạo mới giao dịch bán lẻ cho khách hàng</p>
          </div>
        </div>
      </div>

      <SalesInvoiceForm products={serializedProducts} customers={serializedCustomers} nextSoPhieu={nextSoPhieu} returnUrl="/nhan-vien/giao-dich/ban-hang" />
    </div>
  );
}
