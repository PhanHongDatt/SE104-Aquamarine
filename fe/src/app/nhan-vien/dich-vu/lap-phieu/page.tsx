import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDanhSachLoaiDichVu } from "@/actions/service.action";
import { ServiceReceiptForm } from "@/components/giao-dich/service-receipt-form";

export const metadata = { title: "Lập Phiếu Dịch Vụ – Aquamarine Jewelry & Luxury" };

export default async function LapPhieuDichVuPage() {
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
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/nhan-vien/dich-vu/tra-cuu" 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2 uppercase tracking-tight font-montserrat">
              <Wrench className="w-6 h-6 text-primary" />
              Lập Phiếu Dịch Vụ
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Gia công và kiểm định trang sức</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ServiceReceiptForm serviceTypes={serviceTypes} nextSoPhieu={nextSoPhieu} />
      </div>
    </div>
  );
}
