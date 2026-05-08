import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Aquamarine Jewelry & Luxury",
  description: "Hệ thống quản lý cửa hàng kinh doanh vàng bạc đá quý — Nhóm 08",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen antialiased font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          expand
          toastOptions={{
            style: { fontFamily: "var(--font-sans)" },
          }}
        />
      </body>
    </html>
  );
}
