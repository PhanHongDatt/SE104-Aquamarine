"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function buildBreadcrumbs(pathname: string) {
  const labelMap: Record<string, string> = {
    "": "Trang chủ",
    "danh-muc": "Danh mục",
    "don-vi-tinh": "Đơn vị tính",
    "loai-san-pham": "Loại sản phẩm",
    "san-pham": "Sản phẩm",
    "nha-cung-cap": "Nhà cung cấp",
    "giao-dich": "Giao dịch",
    "mua-hang": "Mua hàng",
    "ban-hang": "Bán hàng",
    "dich-vu": "Dịch vụ",
    "lap-phieu": "Lập phiếu",
    "tra-cuu": "Tra cứu",
    "bao-cao": "Báo cáo",
    "ton-kho": "Tồn kho",
    "doanh-thu": "Doanh thu",
    "cai-dat": "Cài đặt",
  };

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Trang chủ", href: "/" }];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    crumbs.push({ label: labelMap[seg] || seg, href: path });
  }
  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-soft/30 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
            {index < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="text-gray-500 hover:text-primary transition-colors font-medium"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-primary font-semibold">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* User area */}
      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{session.user.name}</p>
              <p className="text-xs text-gray-400">
                {session.user.role === "QUAN_LY" ? "Quản lý" : "Nhân viên"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
          aria-label="Đăng xuất"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium",
            "text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          )}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
