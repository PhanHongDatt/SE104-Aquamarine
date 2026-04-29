import {
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "Tổng quan – Admin | Quản Lý Vàng Bạc Đá Quý",
};

const stats = [
  {
    title: "Doanh thu tháng",
    value: "1.24 tỷ",
    change: "+12.5%",
    up: true,
    icon: TrendingUp,
    desc: "so với tháng trước",
  },
  {
    title: "Sản phẩm",
    value: "248",
    change: "+4",
    up: true,
    icon: Package,
    desc: "sản phẩm đang kinh doanh",
  },
  {
    title: "Phiếu bán hôm nay",
    value: "23",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    desc: "so với hôm qua",
  },
  {
    title: "Tồn kho thấp",
    value: "7",
    change: "-2",
    up: false,
    icon: AlertTriangle,
    desc: "sản phẩm cần nhập thêm",
  },
];

const quickLinks = [
  { label: "Tạo phiếu bán hàng", href: "/admin/giao-dich/ban-hang/tao-moi", color: "bg-primary/10 text-primary" },
  { label: "Tạo phiếu mua hàng", href: "/admin/giao-dich/mua-hang/tao-moi", color: "bg-accent/10 text-accent" },
  { label: "Tạo phiếu dịch vụ", href: "/admin/dich-vu/phieu-dich-vu/tao-moi", color: "bg-emerald-50 text-emerald-600" },
  { label: "Báo cáo doanh thu", href: "/admin/bao-cao/doanh-thu", color: "bg-amber-50 text-amber-600" },
];

export default function AdminDashboardPage() {
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
              {stat.up ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>
                {stat.change} {stat.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">Hoạt động gần đây</h2>
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500">Chức năng đang được phát triển</p>
            <p className="text-xs text-zinc-400">Dữ liệu giao dịch sẽ hiển thị tại đây</p>
          </div>
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
