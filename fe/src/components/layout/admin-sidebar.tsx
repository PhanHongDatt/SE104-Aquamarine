"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Box, Ruler, Truck,
  ShoppingCart, Tag, FileText, ListChecks, BarChart3,
  LineChart, Settings, Users, Gem, ChevronRight, UserCircle,
  Wrench, Shield, Database, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyPermissions } from "@/actions/permissions.action";

type NavItem = {
  href: string;
  icon: any;
  label: string;
  permission?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const adminNavGroups: NavGroup[] = [
  {
    title: "Chính",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
      { href: "/admin/tai-khoan", icon: UserCircle, label: "Tài khoản" },
    ],
  },
  {
    title: "Danh mục",
    items: [
      { href: "/admin/danh-muc/san-pham", icon: Package, label: "Sản phẩm", permission: "DM_SP" },
      { href: "/admin/danh-muc/loai-san-pham", icon: Box, label: "Loại sản phẩm", permission: "DM_LSP" },
      { href: "/admin/danh-muc/don-vi-tinh", icon: Ruler, label: "Đơn vị tính", permission: "DM_DVT" },
      { href: "/admin/danh-muc/khach-hang", icon: Users, label: "Khách hàng", permission: "DM_KH" },
      { href: "/admin/danh-muc/nha-cung-cap", icon: Truck, label: "Nhà cung cấp", permission: "DM_NCC" },
    ],
  },
  {
    title: "Giao dịch",
    items: [
      { href: "/admin/giao-dich/mua-hang", icon: ShoppingCart, label: "Mua hàng", permission: "GD_MUA" },
      { href: "/admin/giao-dich/ban-hang", icon: Tag, label: "Bán hàng", permission: "GD_BAN" },
    ],
  },
  {
    title: "Dịch vụ",
    items: [
      { href: "/admin/dich-vu/phieu-dich-vu/tao-moi", icon: FileText, label: "Lập phiếu", permission: "DV_LAP" },
      { href: "/admin/dich-vu/phieu-dich-vu", icon: Search, label: "Tra cứu phiếu", permission: "DV_TRA" },
      { href: "/admin/dich-vu/loai-dich-vu", icon: ListChecks, label: "Loại dịch vụ", permission: "DV_LDV" },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      { href: "/admin/bao-cao/ton-kho", icon: BarChart3, label: "Tồn kho", permission: "BC_TON" },
      { href: "/admin/bao-cao/doanh-thu", icon: LineChart, label: "Doanh thu", permission: "BC_DTH" },
    ],
  },
  {
    title: "Cài đặt",
    items: [
      { href: "/admin/cai-dat", icon: Settings, label: "Cài đặt hệ thống" },
      { href: "/admin/cai-dat/quy-dinh", icon: Wrench, label: "Thay đổi quy định", permission: "HT_QDI" },
      { href: "/admin/cai-dat/phan-quyen", icon: Shield, label: "Phân quyền", permission: "HT_PHQ" },
      { href: "/admin/cai-dat/sao-luu-phuc-hoi", icon: Database, label: "Sao lưu/Phục hồi", permission: "HT_BAK" },
    ],
  },
];

const EXPANDED_W = 260;
const COLLAPSED_W = 72;

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [dbPermissions, setDbPermissions] = useState<string[] | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  // Lấy quyền real-time từ DB
  const fetchPermissions = useCallback(async () => {
    const result = await getMyPermissions();
    if (result.success) {
      setDbPermissions(result.permissions);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Tự động refresh quyền khi user quay lại tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPermissions();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", fetchPermissions);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", fetchPermissions);
    };
  }, [fetchPermissions]);

  // Ưu tiên quyền từ DB, fallback về JWT
  const effectivePermissions = dbPermissions ?? (session?.user as any)?.permissions;

  // Lọc nhóm nav: chỉ hiển thị item mà người dùng có quyền XEM
  const filteredGroups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        if (role === "QUAN_LY") return true;
        return Array.isArray(effectivePermissions) && effectivePermissions.some(
          (p: string) => p === `${item.permission}:XEM` || p === item.permission
        );
      }),
    }))
    .filter((group) => group.items.length > 0);

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
        {filteredGroups.map((group) => (
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
                const isActive =
                  href === "/admin/dashboard"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors relative group",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                      collapsed && "justify-center"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="admin-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] flex-shrink-0",
                        isActive ? "text-accent" : "text-white/50 group-hover:text-white"
                      )}
                    />
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
          href="/admin/tai-khoan"
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
                <p className="text-white/40 text-[10px] truncate">Quản lý / Admin</p>
              </div>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          )}
        </Link>
      )}
    </motion.aside>
  );
}
