import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDanhSachLoaiDichVu } from "@/actions/service.action";
import { ServiceReceiptForm } from "@/components/giao-dich/service-receipt-form";
import { nextSequentialIdFromValidCodes } from "@/lib/id-generation";

export const metadata = { title: "Lập Phiếu Dịch Vụ – Aquamarine Jewelry & Luxury" };

export default async function LapPhieuDichVuPage() {
  const [serviceTypes, thamSo, customers] = await Promise.all([
    getDanhSachLoaiDichVu(),
    prisma.thamSo.findFirst({ where: { id: 1 } }),
    prisma.khachHang.findMany({ where: { deletedAt: null }, orderBy: { maKH: "asc" } }),
  ]);
  
  // Generate next soPhieu: PDV + 7 digits
  const existingReceipts = await prisma.phieuDichVu.findMany({
    where: { soPhieu: { startsWith: "PDV" } },
    select: { soPhieu: true },
  });
  const nextSoPhieu = nextSequentialIdFromValidCodes(existingReceipts.map((receipt) => receipt.soPhieu), "PDV", 7);

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
        <ServiceReceiptForm
          serviceTypes={serviceTypes}
          customers={JSON.parse(JSON.stringify(customers))}
          nextSoPhieu={nextSoPhieu}
          minPrepaymentPercent={Number(thamSo?.tiLeTraTruocToiThieu ?? 50)}
        />
      </div>
    </div>
  );
}
