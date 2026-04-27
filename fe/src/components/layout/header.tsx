"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronRight, Search, Bell } from "lucide-react";
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
    "he-thong": "Hệ thống",
    "phan-quyen": "Phân quyền",
    "quy-dinh": "Quy định",
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
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-6 sticky top-0 z-30 transition-shadow">
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-sm hidden md:flex">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />}
            {index < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-[13px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-900 font-semibold text-[13px]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Mobile breadcrumb fallback */}
      <div className="md:hidden flex items-center">
        <span className="text-zinc-900 font-semibold text-sm">
          {crumbs[crumbs.length - 1]?.label}
        </span>
      </div>

      <div className="flex items-center gap-4 lg:gap-6 ml-auto">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm mã sản phẩm, phiếu..."
            className="block w-64 pl-9 pr-3 py-1.5 text-sm rounded-lg border border-zinc-200 shadow-sm bg-zinc-50/50 
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all
                       placeholder:text-zinc-400"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
             <kbd className="inline-flex items-center rounded border border-zinc-200 px-1 font-sans text-[10px] font-medium text-zinc-400">⌘K</kbd>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors group">
          <Bell className="w-5 h-5 group-hover:animate-swing" />
          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User context & divider */}
        <div className="h-5 w-[1px] bg-zinc-200 hidden sm:block"></div>

        {/* User profile dropdown trigger */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-zinc-800 leading-tight">{session?.user?.name}</p>
            <p className="text-[11px] text-zinc-500 font-medium">
              {session?.user?.role === "QUAN_LY" ? "Quản lý / Admin" : "Nhân viên"}
            </p>
          </div>
          <div className="relative group cursor-pointer inline-flex">
             <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 text-sm font-bold group-hover:border-zinc-300 transition-colors shadow-sm">
                {session?.user?.name?.charAt(0).toUpperCase()}
             </div>
             
             {/* Dropdown Menu Minimal - using CSS hover instead of complex state to save time since auth logic is minimal here */}
             <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 
                             opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
               <div className="p-2 space-y-1">
                 <button className="w-full text-left px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium">
                   Tài khoản
                 </button>
                 <button className="w-full text-left px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium">
                   Cài đặt
                 </button>
                 <div className="h-[1px] bg-zinc-100 my-1"></div>
                 <button 
                   onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
                   className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                 >
                   <LogOut className="w-4 h-4" />
                   Đăng xuất
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}
