import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { PageTransition } from "@/components/providers/page-transition";
import { AlertCircle, Clock, TrendingUp, DollarSign } from "lucide-react";

export const metadata = {
  title: "Dashboard – Quản Lý Vàng Bạc Đá Quý",
};

const metrics = [
  {
    title: "Doanh thu tháng",
    value: "1.24B ₫",
    subtitle: "Tháng trước: 1.15B",
    icon: DollarSign,
    variant: "default" as const,
    trend: { value: 12.5, label: "tháng này" },
    delay: 0,
  },
  {
    title: "Sản phẩm dưới mức tồn",
    value: 12,
    subtitle: "Cần chú ý nhập thêm",
    icon: AlertCircle,
    variant: "warning" as const,
    delay: 0.1,
  },
  {
    title: "Dịch vụ quá hạn",
    value: 2,
    subtitle: "Khách chưa đến nhận",
    icon: Clock,
    variant: "danger" as const,
    delay: 0.2,
  },
  {
    title: "Lợi nhuận gộp",
    value: "340M ₫",
    subtitle: "Dự kiến tháng này",
    icon: TrendingUp,
    variant: "accent" as const,
    trend: { value: 5.4, label: "tháng này" },
    delay: 0.3,
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const firstName = session?.user?.name?.split(" ").pop() ?? "";

  return (
    <PageTransition>
      <div className="page-container space-y-6 lg:space-y-8">
        
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
               Xuất báo cáo
             </button>
             <button className="px-4 py-2 bg-primary text-sm font-medium text-white rounded-lg shadow-sm hover:bg-primary-hover transition-colors">
               + Lập phiếu
             </button>
          </div>
        </div>

        {/* Row 1: Metrics */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">Tổng quan nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.title} {...m} />
            ))}
          </div>
        </section>

        {/* Row 2: Charts & Activities */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart block - takes up 2/3 width on large screens */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm flex flex-col min-h-[400px]">
            <OverviewChart />
          </div>

          {/* Activities block - takes up 1/3 width */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-sm flex flex-col max-h-[500px]">
            <RecentActivities />
          </div>
        </section>
        
      </div>
    </PageTransition>
  );
}
