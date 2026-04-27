import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";
import { Diamond, Gem } from "lucide-react";

export const metadata = {
  title: "Đăng nhập – Quản Lý Vàng Bạc Đá Quý",
  description: "Đăng nhập vào hệ thống quản lý cửa hàng vàng bạc đá quý",
};

export default async function DangNhapPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-[#0f085a] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />

        {/* Logo area */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Gem className="w-6 h-6 text-accent" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">VàngBạcSystem</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="flex gap-4 mb-4">
            {[Diamond, Gem].map((Icon, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon className="w-7 h-7 text-soft" />
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Quản Lý<br />
            <span className="text-soft">Cửa Hàng</span><br />
            Vàng Bạc Đá Quý
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Hệ thống quản lý toàn diện cho cửa hàng kinh doanh vàng bạc, đá quý và trang sức.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10">
          <p className="text-white/40 text-sm">SE104.Q23 · Nhóm 08 · UIT</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-warm">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gem className="w-6 h-6 text-primary" />
            </div>
            <span className="text-primary font-bold text-lg">VàngBạcSystem</span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-card-hover border border-soft/20">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Chào mừng trở lại</h2>
              <p className="text-sm text-gray-500">Đăng nhập để tiếp tục vào hệ thống</p>
            </div>

            <LoginForm />

            <p className="text-center text-xs text-gray-400 mt-6">
              Quản Lý Cửa Hàng Vàng Bạc Đá Quý · SE104.Q23
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
