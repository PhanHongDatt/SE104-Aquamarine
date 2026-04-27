import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quản Lý Cửa Hàng Vàng Bạc Đá Quý",
  description: "Hệ thống quản lý cửa hàng kinh doanh vàng bạc đá quý",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
