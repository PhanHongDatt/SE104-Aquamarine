import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Đăng ký tài khoản – Aquamarine Jewelry & Luxury",
};

export default async function DangKyPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  redirect("/dang-nhap");
}
