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
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-warm/70">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
