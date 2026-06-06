"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getMyPermissions } from "@/actions/permissions.action";

/**
 * Hook kiểm tra quyền real-time từ DB.
 * Quản lý (QUAN_LY) luôn có tất cả quyền.
 *
 * @example
 * const { hasPermission, loading } = usePermissions();
 * if (hasPermission("DM_SP", "THEM")) { ... }
 */
export function usePermissions() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [permissions, setPermissions] = useState<string[] | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const result = await getMyPermissions();
      if (result.success) {
        setPermissions(result.permissions);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Refresh on tab focus (detect admin just changed permissions)
  useEffect(() => {
    const handleFocus = () => fetchPermissions();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchPermissions]);

  /**
   * Kiểm tra quyền theo mã chức năng + hành động.
   * @param maChucNang - "DM_SP", "DM_KH", "HT_USR", ...
   * @param hanhDong - "XEM", "THEM", "SUA", "XOA"
   */
  const hasPermission = useCallback(
    (maChucNang: string, hanhDong: string): boolean => {
      // Quản lý luôn có tất cả quyền
      if (role === "QUAN_LY") return true;
      // Chưa load → deny (safe default)
      if (!permissions || permissions.length === 0) return false;
      return permissions.some(
        (p) => p === `${maChucNang}:${hanhDong}` || p === maChucNang
      );
    },
    [role, permissions]
  );

  return { permissions, hasPermission, loading: permissions === null };
}
