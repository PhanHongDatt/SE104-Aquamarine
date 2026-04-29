import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";
import { Gem, Diamond, Sparkles } from "lucide-react";

export const metadata = {
  title: "Đăng nhập – Quản Lý Vàng Bạc Đá Quý",
};

export default async function DangNhapPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(session.user.role === "QUAN_LY" ? "/admin/dashboard" : "/");
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d084d] via-[#170C79] to-[#1e1099]" />

        {/* Animated blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full
                        bg-accent/20 blur-[80px] animate-blob-1 pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[380px] h-[380px] rounded-full
                        bg-soft/25 blur-[70px] animate-blob-2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full
                        bg-primary/40 blur-[90px] animate-blob-3 pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Gem className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="text-white font-bold tracking-wide">VàngBạcSystem</span>
              <p className="text-white/40 text-xs">SE104.Q23</p>
            </div>
          </div>

          {/* Center hero */}
          <div className="space-y-6">
            {/* Floating icons */}
            <div className="flex gap-4 mb-2">
              {[
                { Icon: Diamond, bg: "bg-accent/15", color: "text-soft" },
                { Icon: Gem, bg: "bg-soft/15", color: "text-accent" },
                { Icon: Sparkles, bg: "bg-white/10", color: "text-white/60" },
              ].map(({ Icon, bg, color }, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-2xl ${bg} border border-white/10 flex items-center justify-center`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              ))}
            </div>

            <div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Quản Lý<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-soft">
                  Vàng Bạc
                </span><br />
                Đá Quý
              </h1>
              <p className="text-white/50 text-base mt-4 leading-relaxed max-w-[300px]">
                Hệ thống quản lý toàn diện — hiệu suất cao, bảo mật, dễ sử dụng.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 pt-2">
              {[
                { label: "Sản phẩm", value: "248+" },
                { label: "Giao dịch/ngày", value: "50+" },
                { label: "Uptime", value: "99.9%" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-white font-bold text-xl">{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/25 text-xs">
            Nhóm 08 · SE104.Q23 · UIT © 2024
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-[#FAFAFA]">
        {/* Subtle background hints */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full
                        bg-zinc-200/40 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full
                        bg-slate-200/50 blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gem className="w-6 h-6 text-primary" />
            </div>
            <span className="text-primary font-bold text-lg">VàngBạcSystem</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-zinc-200/80 relative z-10">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-accent">Hệ thống đang hoạt động</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Chào mừng trở lại 👋</h2>
              <p className="text-sm text-gray-400 mt-1">Đăng nhập để tiếp tục vào hệ thống</p>
            </div>

            <LoginForm />

            <p className="text-center text-xs text-gray-300 mt-6">
              Quản Lý Cửa Hàng Vàng Bạc Đá Quý · SE104.Q23
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
