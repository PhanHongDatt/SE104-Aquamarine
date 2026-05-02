"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Shield, Key, LogOut, ChevronLeft, Calendar, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { updateNguoiDung } from "@/actions/user.action";

export function UserProfileView() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await updateNguoiDung(session?.user?.id as string, {
        hoTen: session?.user?.name,
        maNhom: session?.user?.maNhom,
        matKhau: newPassword
      });

      if (res.success) {
        toast.success("Đổi mật khẩu thành công");
        setNewPassword("");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi đổi mật khẩu");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Hồ sơ cá nhân</h1>
            <p className="text-sm text-zinc-500 mt-1">Thông tin tài khoản và bảo mật</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
          className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-2"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border-4 border-white shadow-lg shadow-primary/5">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{session.user.name}</h2>
              <p className="text-sm text-zinc-400 font-mono mt-1">ID: {session.user.id}</p>
            </div>
            <div className="pt-4 flex justify-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                session.user.role === 'QUAN_LY' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {session.user.role === 'QUAN_LY' ? 'Quản trị viên' : 'Nhân viên hệ thống'}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-3">
               <Shield className="w-5 h-5 text-accent" />
               <h3 className="font-bold text-sm">Quyền hạn tài khoản</h3>
             </div>
             <p className="text-xs text-zinc-400 leading-relaxed">
               Tài khoản của bạn được cấp quyền <strong>{session.user.role === 'QUAN_LY' ? 'Quản lý toàn diện' : 'Nghiệp vụ cơ bản'}</strong>. Mọi thao tác quan trọng trên hệ thống đều được ghi lại để đảm bảo tính minh bạch.
             </p>
          </div>
        </div>

        {/* Account Details & Security */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-primary" />
                Thông tin định danh
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Họ và tên</p>
                <p className="font-bold text-zinc-900">{session.user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email liên kết</p>
                <p className="font-bold text-zinc-900 italic">{session.user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Vai trò</p>
                <p className="font-bold text-zinc-900">{session.user.role === 'QUAN_LY' ? 'Quản lý' : 'Nhân viên'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ngày gia nhập</p>
                <p className="font-bold text-zinc-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-300" />
                  Hệ thống ghi nhận
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Bảo mật & Đổi mật khẩu
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="max-w-md space-y-4">
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="Nhập mật khẩu mới ít nhất 8 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button 
                  onClick={handleUpdatePassword} 
                  loading={isUpdating}
                  className="rounded-2xl px-8 font-bold shadow-lg shadow-primary/20"
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
