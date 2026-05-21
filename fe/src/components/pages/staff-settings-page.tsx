import { Settings, ArrowLeft, Info, HelpCircle, ShieldCheck, Palette } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Cài đặt hệ thống – Aquamarine Jewelry" };

export default function CaiDatPage() {
  return (
    <div className="page-container space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Cài đặt ứng dụng
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Tùy chỉnh cá nhân và thông tin hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 text-zinc-900">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Giao diện & Hiển thị</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-800">Chế độ tối (Dark Mode)</p>
                <p className="text-[10px] text-zinc-500">Tối ưu hóa hiển thị ban đêm</p>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 italic">Đang phát triển</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-800">Ngôn ngữ hệ thống</p>
                <p className="text-[10px] text-zinc-500">Tiếng Việt (Mặc định)</p>
              </div>
              <span className="text-xs font-bold text-primary">VN</span>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 text-zinc-900">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-bold">An toàn & Bảo mật</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-sm font-bold text-green-800">Tình trạng kết nối</p>
              <p className="text-[10px] text-green-600 mt-0.5">Hệ thống đang hoạt động bình thường</p>
            </div>
            <Link 
              href="/tai-khoan"
              className="block p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-zinc-100 transition-colors"
            >
              <p className="text-sm font-bold text-zinc-800">Đổi mật khẩu</p>
              <p className="text-[10px] text-zinc-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="md:col-span-2 bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <Settings className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-accent">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Thông tin Aquamarine Jewelry</h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Phiên bản hệ thống: <strong>v2.4.0 (2026 Edition)</strong>. 
              <br />Hệ thống được phát triển chuyên biệt cho quản lý vàng bạc đá quý, tích hợp các nghiệp vụ tính toán tỷ lệ lợi nhuận, định mức tồn kho và kiểm định trang sức cao cấp.
            </p>
            <div className="pt-4 flex gap-4">
               <button className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
                 <HelpCircle className="w-3.5 h-3.5" />
                 Trung tâm trợ giúp
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
