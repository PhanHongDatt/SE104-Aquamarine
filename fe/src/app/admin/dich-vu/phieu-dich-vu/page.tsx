import { FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ServiceSearchList } from "@/components/giao-dich/service-search-list";

export const metadata = { title: "Phiếu dịch vụ – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminPhieuDichVuPage() {
  const data = await prisma.phieuDichVu.findMany({
    include: { chiTietDichVu: true },
    orderBy: { ngayLap: 'desc' }
  });
  const computedData = data.map((phieu) => ({
    ...phieu,
    tinhTrang: phieu.chiTietDichVu.length > 0 && phieu.chiTietDichVu.every((ct) => ct.ngayGiao)
      ? "HoanThanh"
      : "ChuaHoanThanh",
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Phiếu dịch vụ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý phiếu gia công và kiểm định</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dich-vu/phieu-dich-vu/tao-moi"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Lập phiếu mới
          </Link>
        </div>
      </div>

      <ServiceSearchList initialData={JSON.parse(JSON.stringify(computedData))} isAdmin={true} />
    </div>
  );
}
