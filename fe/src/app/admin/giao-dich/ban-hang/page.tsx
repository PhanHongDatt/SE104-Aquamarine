import { Tag, Plus } from "lucide-react";
import { getDanhSachPhieuBanHang } from "@/actions/giao-dich";
import { SalesInvoiceList } from "@/components/giao-dich/sales-invoice-list";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Bán hàng – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminBanHangPage() {
  let data = [];
  let products = [];
  let customers = [];
  let error: string | null = null;

  try {
    const [rawData, rawProducts, rawCustomers] = await Promise.all([
      getDanhSachPhieuBanHang(),
      prisma.sanPham.findMany({
        where: { deletedAt: null },
        include: {
          loaiSanPham: true,
          donViTinh: true,
        },
        orderBy: { maSP: "asc" },
      }),
      prisma.khachHang.findMany({
        where: { deletedAt: null },
        orderBy: { maKH: "asc" },
      }),
    ]);
    data = JSON.parse(JSON.stringify(rawData)); // Serialize for client component
    products = JSON.parse(JSON.stringify(rawProducts));
    customers = JSON.parse(JSON.stringify(rawCustomers));
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 cursor-default select-none">
            <Tag className="w-6 h-6 text-primary" />
            Phiếu bán hàng
          </h1>
          <p className="text-sm text-zinc-500 mt-1 cursor-default select-none">Quản lý các phiếu bán hàng cho khách</p>
        </div>
        <a
          href="/admin/giao-dich/ban-hang/tao-moi"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tạo phiếu bán
        </a>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra Docker.
        </div>
      )}

      <SalesInvoiceList data={data} products={products} customers={customers} returnUrl="/admin/giao-dich/ban-hang" />
    </div>
  );
}
