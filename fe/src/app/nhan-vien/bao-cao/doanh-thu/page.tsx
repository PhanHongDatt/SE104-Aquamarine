import { TrendingUp } from "lucide-react";
import { RevenueReportView } from "@/components/dashboard/revenue-report-view";

export const metadata = { title: "Báo Cáo Doanh Thu – Aquamarine Jewelry & Luxury" };

export default function BaoCaoDoanhThuPage() {
  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Báo Cáo Doanh Thu
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Tổng hợp và phân tích doanh thu bán hàng, dịch vụ</p>
        </div>
      </div>

      <RevenueReportView />
    </div>
  );
}
