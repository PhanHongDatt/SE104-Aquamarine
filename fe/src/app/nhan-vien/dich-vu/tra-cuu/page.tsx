import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ServiceSearchList } from "@/components/giao-dich/service-search-list";

export const metadata = { title: "Tra Cứu Dịch Vụ – Quản Lý Vàng Bạc Đá Quý" };

export default async function TraCuuDichVuPage() {
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
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Tra Cứu Dịch Vụ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Tìm kiếm và quản lý phiếu gia công, kiểm định</p>
        </div>
        <Link 
          href="/nhan-vien/dich-vu/lap-phieu"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Lập phiếu mới
        </Link>
      </div>

      <ServiceSearchList initialData={JSON.parse(JSON.stringify(computedData))} isAdmin={false} />
    </div>
  );
}
