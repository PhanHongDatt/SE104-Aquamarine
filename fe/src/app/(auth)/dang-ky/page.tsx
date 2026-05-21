import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Gem } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = {
  title: "Đăng ký tài khoản – Aquamarine Jewelry & Luxury",
};

export default async function DangKyPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6 py-12">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Gem className="w-6 h-6 text-primary" />
          </div>
          <span className="text-primary font-bold text-lg uppercase">Aquamarine</span>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-zinc-200/80">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
            <p className="text-sm text-gray-400 mt-2">
              Tài khoản mới mặc định thuộc nhóm nhân viên. Quản lý có thể đổi nhóm quyền sau khi duyệt.
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
