"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Box, Ruler, Truck,
  ShoppingCart, Tag, Wrench, Search, BarChart3,
  LineChart, Users, Settings, Gem, ChevronRight, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "Chính",
    items: [
      { href: "/nhan-vien", icon: LayoutDashboard, label: "Tổng quan" },
      { href: "/nhan-vien/tai-khoan", icon: UserCircle, label: "Tài khoản" },
    ],
  },
  {
    title: "Danh mục (Xem)",
    items: [
      { href: "/nhan-vien/danh-muc/san-pham", icon: Package, label: "Sản phẩm" },
      { href: "/nhan-vien/danh-muc/loai-san-pham", icon: Box, label: "Loại sản phẩm" },
      { href: "/nhan-vien/danh-muc/don-vi-tinh", icon: Ruler, label: "Đơn vị tính" },
      { href: "/nhan-vien/danh-muc/nha-cung-cap", icon: Truck, label: "Nhà cung cấp" },
    ],
  },
  {
    title: "Giao dịch",
    items: [
      { href: "/nhan-vien/giao-dich/ban-hang", icon: Tag, label: "Phiếu bán" },
      { href: "/nhan-vien/giao-dich/mua-hang", icon: ShoppingCart, label: "Phiếu mua" },
    ],
  },
  {
    title: "Dịch vụ",
    items: [
      { href: "/nhan-vien/dich-vu/lap-phieu", icon: Wrench, label: "Lập phiếu" },
      { href: "/nhan-vien/dich-vu/tra-cuu", icon: Search, label: "Tra cứu & Trả đồ" },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      { href: "/nhan-vien/bao-cao/ton-kho", icon: BarChart3, label: "Báo cáo tồn kho" },
    ],
  },
];

const EXPANDED_W = 260;
const COLLAPSED_W = 72;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen overflow-visible flex flex-col flex-shrink-0 relative bg-primary z-[50]"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
        className="absolute -right-3 top-[32px] z-[60] w-6 h-6 rounded-full bg-primary border-2 border-[#1E12A1] flex items-center justify-center text-white shadow-md hover:border-accent transition-colors"
      >
        <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronRight className="w-3 h-3" />
        </motion.span>
      </motion.button>

      <div className={cn("flex items-center gap-3 border-b border-white/5 relative z-10", collapsed ? "px-3 py-5 justify-center" : "px-5 py-5")}>
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
          className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0"
        >
          <Gem className="w-4.5 h-4.5 text-accent" />
        </motion.div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-white font-bold text-sm tracking-wide uppercase">Aquamarine</p>
              <p className="text-white/40 text-[10px]">Jewelry & Luxury</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-hidden space-y-6 relative z-10">
        {navGroups.map((group) => (
          <div key={group.title} className="relative">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30"
                >
                  {group.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {group.items.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || (href !== "/nhan-vien" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors relative group",
                      isActive ? "text-white bg-white/10" : "text-white/60 hover:bg-white/5 hover:text-white",
                      collapsed && "justify-center"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive ? "text-accent" : "text-white/50 group-hover:text-white")} />
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {session?.user && (
        <Link 
          href="/nhan-vien/tai-khoan"
          className={cn(
            "border-t border-white/5 py-4 px-3 relative z-10 block hover:bg-white/5 transition-colors", 
            collapsed && "flex justify-center"
          )}
        >
          {collapsed ? (
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-white text-xs font-bold">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-cyan-200 text-xs font-bold flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{session.user.name}</p>
                <p className="text-white/40 text-[10px] truncate">{role === "QUAN_LY" ? "Admin" : "Nhân viên"}</p>
              </div>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          )}
        </Link>
      )}
    </motion.aside>
  );
}
