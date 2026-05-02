import { Box } from "lucide-react";
import { InventoryReportView } from "@/components/dashboard/inventory-report-view";

export const metadata = { title: "Báo Cáo Tồn Kho – Aquamarine Jewelry & Luxury" };

export default function BaoCaoTonKhoPage() {
  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Box className="w-6 h-6 text-primary" />
            Báo Cáo Tồn Kho
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Theo dõi biến động và cảnh báo mức tồn sản phẩm</p>
        </div>
      </div>

      <InventoryReportView />
    </div>
  );
}
