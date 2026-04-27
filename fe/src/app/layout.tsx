import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
