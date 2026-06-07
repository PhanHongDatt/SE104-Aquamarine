import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Header } from "@/components/layout/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/dang-nhap");
  if (session.user.maNhom !== "QUANLY") redirect("/");

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#FAFAFA]">
            <div className="absolute top-[-100px] right-[-80px] w-[500px] h-[500px] rounded-full
                            bg-zinc-200/40 blur-[120px] animate-blob-1" />
            <div className="absolute bottom-[-80px] left-[200px] w-[400px] h-[400px] rounded-full
                            bg-slate-200/40 blur-[100px] animate-blob-2" />
          </div>

          <Header />

          <main className="flex-1 overflow-y-auto relative z-10">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
