import { TrendingUp } from "lucide-react";
import { RevenueReportView } from "@/components/dashboard/revenue-report-view";

export const metadata = { title: "Báo cáo doanh thu – Admin | Aquamarine Jewelry & Luxury" };

export default function AdminBaoCaoDoanhThuPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Báo cáo doanh thu
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Phân tích hiệu quả kinh doanh bán hàng và dịch vụ</p>
      </div>

      <RevenueReportView />
    </div>
  );
}
