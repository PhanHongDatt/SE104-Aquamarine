import { Settings, Shield, Wrench, ArrowLeft, Info, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Cài đặt & Hệ thống – Admin | Aquamarine Jewelry" };

export default function AdminCaiDatPage() {
  const settingsOptions = [
    {
      title: "Thay đổi quy định",
      desc: "Cấu hình tham số QĐ2, QĐ3, QĐ6 (Lợi nhuận, Tồn kho, Trả trước)",
      href: "/admin/cai-dat/quy-dinh",
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Phân quyền người dùng",
      desc: "Quản lý tài khoản nhân viên, cấp mã và thiết lập vai trò",
      href: "/admin/cai-dat/phan-quyen",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/dashboard" 
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Cài đặt hệ thống
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Trung tâm điều hành tham số và nhân sự Aquamarine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsOptions.map((opt) => (
          <Link 
            key={opt.href} 
            href={opt.href}
            className="group bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm hover:border-primary hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-6">
              <div className={`w-14 h-14 rounded-2xl ${opt.bg} ${opt.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <opt.icon className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900 group-hover:text-primary transition-colors">{opt.title}</h2>
                <p className="text-sm text-zinc-500 leading-relaxed">{opt.desc}</p>
              </div>
            </div>
          </Link>
        ))}

        {/* System Version Info */}
        <div className="md:col-span-2 bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <Settings className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 -rotate-12" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-accent">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">Thông tin Aquamarine Admin</h3>
              </div>
              <p className="text-sm text-zinc-400 max-w-xl">
                Phiên bản quản trị: <strong>v2.4.0 (Build 2026.05.02)</strong>. 
                <br />Hệ thống đang hoạt động với đầy đủ các module: Bán hàng, Mua hàng, Dịch vụ, Báo cáo và Quản trị nhân sự.
              </p>
            </div>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 border border-white/5">
              <HelpCircle className="w-4 h-4" />
              Hướng dẫn vận hành
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
