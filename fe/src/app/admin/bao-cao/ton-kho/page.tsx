import { Box } from "lucide-react";
import { InventoryReportView } from "@/components/dashboard/inventory-report-view";

export const metadata = { title: "Báo cáo tồn kho – Admin | Aquamarine Jewelry & Luxury" };

export default function AdminBaoCaoTonKhoPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Box className="w-6 h-6 text-primary" />
          Báo cáo tồn kho
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Phân tích tình hình kho và cảnh báo mức tồn tối thiểu</p>
      </div>

      <InventoryReportView />
    </div>
  );
}
