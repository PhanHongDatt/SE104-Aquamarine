import { getPhieuDichVuChiTiet } from "@/actions/service.action";
import { ServiceReceiptDetail } from "@/components/giao-dich/service-receipt-detail";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = { title: "Chi tiết phiếu dịch vụ | Aquamarine Jewelry & Luxury" };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ServiceReceiptDetailPage({ params }: PageProps) {
  // Use id as soPhieu
  const [phieu, serviceTypes, customers, thamSo] = await Promise.all([
    getPhieuDichVuChiTiet(params.id),
    prisma.loaiDichVu.findMany({ orderBy: { maDV: "asc" } }),
    prisma.khachHang.findMany({ where: { deletedAt: null }, orderBy: { maKH: "asc" } }),
    prisma.thamSo.findFirst({ where: { id: 1 } }),
  ]);

  if (!phieu) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8">
      <ServiceReceiptDetail
        phieu={phieu}
        isAdmin={false}
        serviceTypes={JSON.parse(JSON.stringify(serviceTypes))}
        customers={JSON.parse(JSON.stringify(customers))}
        minPrepaymentPercent={Number(thamSo?.tiLeTraTruocToiThieu ?? 50)}
      />
    </div>
  );
}
