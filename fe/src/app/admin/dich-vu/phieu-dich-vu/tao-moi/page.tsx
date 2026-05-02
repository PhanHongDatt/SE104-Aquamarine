import { ArrowLeft, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDanhSachLoaiDichVu } from "@/actions/service.action";
import { ServiceReceiptForm } from "@/components/giao-dich/service-receipt-form";
import Link from "next/link";

export const metadata = { title: "Tạo phiếu dịch vụ – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminTaoPhieuDichVuPage() {
  const serviceTypes = await getDanhSachLoaiDichVu();
  
  // Generate next soPhieu: PDV + 7 digits
  const lastPhieu = await prisma.phieuDichVu.findFirst({
    where: { soPhieu: { startsWith: "PDV" } },
    orderBy: { soPhieu: "desc" },
  });

  let nextNumber = 1;
  if (lastPhieu) {
    const lastNumStr = lastPhieu.soPhieu.replace("PDV", "");
    nextNumber = parseInt(lastNumStr) + 1;
  }
  
  const nextSoPhieu = `PDV${nextNumber.toString().padStart(7, "0")}`;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dich-vu/phieu-dich-vu"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-primary" />
          Tạo phiếu dịch vụ mới
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Nhập thông tin phiếu gia công và kiểm định</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ServiceReceiptForm 
          serviceTypes={serviceTypes} 
          nextSoPhieu={nextSoPhieu} 
          redirectPath="/admin/dich-vu/phieu-dich-vu"
        />
      </div>
    </div>
  );
}
