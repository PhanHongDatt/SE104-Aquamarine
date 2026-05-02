import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";
import { Gem, Diamond, Sparkles } from "lucide-react";

export const metadata = {
  title: "Đăng nhập – Aquamarine Jewelry & Luxury",
};

export default async function DangNhapPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d084d] via-[#170C79] to-[#1e1099]" />

        {/* Animated blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full
                        bg-accent/20 blur-[80px] animate-blob-1 pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[380px] h-[380px] rounded-full
                        bg-soft/25 blur-[70px] animate-blob-2 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-16 py-12 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Gem className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="text-white font-bold tracking-wide uppercase">Aquamarine</span>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">Jewelry & Luxury</p>
            </div>
          </div>

          {/* Center hero */}
          <div className="space-y-6">
            <div className="flex gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-white/10 flex items-center justify-center">
                <Diamond className="w-6 h-6 text-soft" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-soft/15 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
            </div>

            <div className="max-w-[400px]">
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight uppercase">
                Hệ Thống<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-soft">
                  Quản Trị
                </span><br />
                Aquamarine
              </h1>
              <p className="text-white/50 text-sm mt-6 leading-relaxed">
                Giải pháp vận hành cửa hàng Vàng Bạc Đá Quý chuyên nghiệp. Bảo mật, chính xác và hiệu quả vượt trội.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/20 text-[10px] uppercase tracking-widest font-medium">
            Aquamarine v2.4.0 · Internal System
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-[#FAFAFA]">
        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Gem className="w-6 h-6 text-primary" />
            </div>
            <span className="text-primary font-bold text-lg uppercase">Aquamarine</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-zinc-200/80 relative z-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Đăng nhập hệ thống</h2>
              <p className="text-sm text-gray-400 mt-2">Vui lòng cung cấp thông tin tài khoản</p>
            </div>

            <LoginForm />

            <div className="mt-10 pt-6 border-t border-zinc-100 text-center">
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                Aquamarine Jewelry & Luxury
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
