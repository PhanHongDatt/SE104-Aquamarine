"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Wrench,
  BarChart3,
  Settings,
  Gem,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Trang chủ" },
  { href: "/danh-muc", icon: BookOpen, label: "Danh mục" },
  { href: "/giao-dich", icon: ArrowLeftRight, label: "Giao dịch" },
  { href: "/dich-vu", icon: Wrench, label: "Dịch vụ" },
  { href: "/bao-cao", icon: BarChart3, label: "Báo cáo" },
  { href: "/cai-dat", icon: Settings, label: "Cài đặt", role: "QUAN_LY" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleItems = navItems.filter(
    (item) => !item.role || item.role === role
  );

  return (
    <aside
      className={cn(
        "h-screen bg-primary flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0",
        "shadow-[4px_0_24px_rgba(23,12,121,0.15)]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-primary border-2 border-white/20 flex items-center justify-center text-white hover:bg-primary-hover transition-colors shadow-md"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/10", collapsed && "justify-center px-3")}>
        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Gem className="w-5 h-5 text-accent" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">VàngBạcSystem</p>
            <p className="text-white/40 text-xs whitespace-nowrap">SE104.Q23</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hidden">
        {!collapsed && (
          <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu chính
          </p>
        )}
        {visibleItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "sidebar-link",
                isActive && "active",
                collapsed && "justify-center px-3"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {session?.user && (
        <div className={cn(
          "px-3 py-4 border-t border-white/10",
          collapsed && "flex justify-center"
        )}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-white text-xs font-bold">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium leading-tight truncate">{session.user.name}</p>
                <p className="text-white/40 text-[10px] truncate">
                  {role === "QUAN_LY" ? "Quản lý" : "Nhân viên"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
