import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "Quản Lý Cửa Hàng Vàng Bạc Đá Quý",
  description: "Hệ thống quản lý cửa hàng kinh doanh vàng bạc đá quý — SE104.Q23 Nhóm 08",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          expand
          toastOptions={{
            style: { fontFamily: "var(--font-inter), system-ui, sans-serif" },
          }}
        />
      </body>
    </html>
  );
}
