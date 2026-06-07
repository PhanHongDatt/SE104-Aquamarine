import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;
    const isManager = token?.maNhom === "QUANLY";

    // Helper: redirect về /nhan-vien kèm thông báo lỗi
    function denyAccess() {
      const url = new URL("/nhan-vien", req.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    // 1. Chặn truy cập Admin nếu không phải QUAN_LY
    if (pathname.startsWith("/admin") && !isManager) {
      return denyAccess();
    }

    // 2. Kiểm tra quyền cho tất cả nhóm không phải QUAN_LY (bao gồm NHAN_VIEN và nhóm custom)
    if (!isManager) {
      const staffPermissionRoutes = [
        { route: "/nhan-vien/giao-dich/ban-hang/tao-moi", permission: "GD_BAN", action: "THEM" },
        { route: "/nhan-vien/giao-dich/mua-hang/tao-moi", permission: "GD_MUA", action: "THEM" },
        { route: "/nhan-vien/dich-vu/lap-phieu", permission: "DV_LAP", action: "THEM" },
        { route: "/nhan-vien/danh-muc/san-pham", permission: "DM_SP", action: "XEM" },
        { route: "/nhan-vien/danh-muc/khach-hang", permission: "DM_KH", action: "XEM" },
        { route: "/nhan-vien/danh-muc/nha-cung-cap", permission: "DM_NCC", action: "XEM" },
        { route: "/nhan-vien/danh-muc/don-vi-tinh", permission: "DM_DVT", action: "XEM" },
        { route: "/nhan-vien/danh-muc/loai-san-pham", permission: "DM_LSP", action: "XEM" },
        { route: "/nhan-vien/giao-dich/ban-hang", permission: "GD_BAN", action: "XEM" },
        { route: "/nhan-vien/giao-dich/mua-hang", permission: "GD_MUA", action: "XEM" },
        { route: "/nhan-vien/dich-vu/tra-cuu", permission: "DV_TRA", action: "XEM" },
        { route: "/nhan-vien/dich-vu/loai-dich-vu", permission: "DV_LDV", action: "XEM" },
        { route: "/nhan-vien/bao-cao/ton-kho", permission: "BC_TON", action: "XEM" },
        { route: "/nhan-vien/bao-cao/doanh-thu", permission: "BC_DTH", action: "XEM" },
      ];

      const matchedStaffRoute = staffPermissionRoutes.find(item => pathname.startsWith(item.route));
      if (matchedStaffRoute) {
        // Luôn kiểm tra DB để cả cấp và thu hồi quyền có hiệu lực ngay.
        try {
          const apiUrl = new URL(`/api/auth/permissions-check`, req.url);
          apiUrl.searchParams.set("maChucNang", matchedStaffRoute.permission);
          apiUrl.searchParams.set("hanhDong", matchedStaffRoute.action);
          const res = await fetch(apiUrl.toString(), {
            headers: { cookie: req.headers.get("cookie") ?? "" },
            cache: "no-store",
          });
          const data = await res.json();
          if (data.allowed) {
            return; // DB có quyền → cho qua
          }
        } catch (e) {
          console.error("[Middleware] DB permission check failed:", e);
        }

        return denyAccess();
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/dang-nhap",
    },
  }
);

export const config = {
  matcher: [
    "/((?!dang-nhap|dang-ky|api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
