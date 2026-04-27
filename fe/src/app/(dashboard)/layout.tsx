import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/providers/session-provider";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/dang-nhap");

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {/* Dynamic mesh background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#FAFAFA]">
            {/* Floating blobs - extremely subtle */}
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
