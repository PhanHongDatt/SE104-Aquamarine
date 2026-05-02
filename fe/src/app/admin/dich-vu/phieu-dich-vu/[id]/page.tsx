import { getPhieuDichVuChiTiet } from "@/actions/service.action";
import { ServiceReceiptDetail } from "@/components/giao-dich/service-receipt-detail";
import { notFound } from "next/navigation";

export const metadata = { title: "Chi tiết phiếu dịch vụ | Aquamarine Jewelry & Luxury" };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AdminServiceReceiptDetailPage({ params }: PageProps) {
  const phieu = await getPhieuDichVuChiTiet(params.id);

  if (!phieu) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8">
      <ServiceReceiptDetail phieu={phieu} isAdmin={true} />
    </div>
  );
}
