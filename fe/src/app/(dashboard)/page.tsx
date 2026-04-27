import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProjectInfo } from "@/components/dashboard/project-info";
import { AlertTriangle, ClipboardList, TrendingUp, Package } from "lucide-react";

export const metadata = {
  title: "Trang chủ – Quản Lý Vàng Bạc Đá Quý",
};

// Mock data – replace with real API calls to `be` service when ready
const mockMetrics = {
  lowStockCount: 3,
  pendingServices: 7,
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="page-container space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {session?.user?.name?.split(" ").pop()} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Metrics */}
      <section aria-labelledby="quick-metrics-heading">
        <h2 id="quick-metrics-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Tổng quan nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Sản phẩm tồn kho thấp"
            value={mockMetrics.lowStockCount}
            subtitle="Cần nhập thêm hàng"
            icon={AlertTriangle}
            variant="warning"
          />
          <MetricCard
            title="Phiếu dịch vụ chưa hoàn thành"
            value={mockMetrics.pendingServices}
            subtitle="Đang chờ xử lý"
            icon={ClipboardList}
            variant="danger"
          />
          <MetricCard
            title="Doanh thu hôm nay"
            value="12.5M ₫"
            subtitle="So với hôm qua"
            icon={TrendingUp}
            variant="accent"
            trend={{ value: 8.2, label: "hôm nay" }}
          />
          <MetricCard
            title="Tổng sản phẩm"
            value="248"
            subtitle="Trong kho"
            icon={Package}
            variant="default"
          />
        </div>
      </section>

      {/* Project Info */}
      <section aria-labelledby="project-info-heading">
        <h2 id="project-info-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Thông tin dự án
        </h2>
        <ProjectInfo />
      </section>
    </div>
  );
}
