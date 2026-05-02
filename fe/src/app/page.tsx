import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/dang-nhap");
  }

  if (session.user.role === "QUAN_LY") {
    redirect("/admin/dashboard");
  }

  return redirect("/nhan-vien");
}

// Note: To support /dashboard, we might need to rename (dashboard)/page.tsx or ensure routing works.
// Actually, let's redirect to '/' if we keep (dashboard) as the root group.
// But wait, the user mentioned prefixes. Let's stick to the current Next.js group logic but clear it up.
