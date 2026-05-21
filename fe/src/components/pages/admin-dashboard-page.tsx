import {
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Tổng quan – Admin | Aquamarine Jewelry & Luxury",
};

function formatCurrency(value: number) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + " tỷ";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + " triệu";
  return value.toLocaleString("vi-VN") + " đ";
}

function toCount(value: unknown) {
  return Number(value ?? 0);
}

export default async function AdminDashboardPage() {
  // 1. Fetch real stats from Monolith Database
  const [productCount, totalRevenue, todaySales, lowStockCount] = await Promise.all([
    prisma.sanPham.count({ where: { deletedAt: null } }),
    prisma.phieuBanHang.aggregate({ _sum: { tongTien: true } }),
    prisma.phieuBanHang.count({
      where: {
        ngayLap: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "SanPham"
      WHERE "deletedAt" IS NULL AND "tonKho" < "tonToiThieu"
    `
  ]);
  const lowStockTotal = toCount(lowStockCount[0]?.count);

  const stats = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(Number(totalRevenue._sum.tongTien || 0)),
      change: "Tất cả thời gian",
      up: true,
      icon: TrendingUp,
      desc: "",
    },
    {
      title: "Sản phẩm",
      value: productCount.toString(),
      change: "Đang kinh doanh",
      up: true,
      icon: Package,
      desc: "",
    },
    {
      title: "Phiếu bán hôm nay",
      value: todaySales.toString(),
      change: "Phiếu mới",
      up: true,
      icon: ShoppingCart,
      desc: "",
    },
    {
      title: "Cần nhập thêm",
      value: lowStockTotal.toString(),
      change: "Sản phẩm",
      up: false,
      icon: AlertTriangle,
      desc: "dưới mức tối thiểu",
    },
  ];

  const quickLinks = [
    { label: "Tạo phiếu bán hàng", href: "/admin/giao-dich/ban-hang/tao-moi", color: "bg-primary/10 text-primary" },
    { label: "Tạo phiếu mua hàng", href: "/admin/giao-dich/mua-hang/tao-moi", color: "bg-accent/10 text-accent" },
    { label: "Tạo phiếu dịch vụ", href: "/admin/dich-vu/phieu-dich-vu/tao-moi", color: "bg-emerald-50 text-emerald-600" },
    { label: "Báo cáo doanh thu", href: "/admin/bao-cao/doanh-thu", color: "bg-amber-50 text-amber-600" },
  ];

  const recentTransactions = await prisma.phieuBanHang.findMany({
    take: 5,
    orderBy: { ngayLap: 'desc' },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tổng quan</h1>
        <p className="text-sm text-zinc-500 mt-1">Chào mừng trở lại, Admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500 font-medium">{stat.title}</p>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                stat.up ? "text-green-600" : "text-red-500"
              }`}
            >
              <span>
                {stat.change} {stat.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Giao dịch gần đây</h2>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.soPhieu} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{tx.soPhieu}</p>
                      <p className="text-xs text-zinc-500">{new Date(tx.ngayLap).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">+{formatCurrency(Number(tx.tongTien))}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 ${link.color}`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
