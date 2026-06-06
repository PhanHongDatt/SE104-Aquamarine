import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;
    const jwtPermissions = Array.isArray(token?.permissions) ? token.permissions : [];

    // Helper: redirect về /nhan-vien kèm thông báo lỗi
    function denyAccess() {
      const url = new URL("/nhan-vien", req.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    // 1. Chặn truy cập Admin nếu không phải QUAN_LY
    if (pathname.startsWith("/admin") && token?.role !== "QUAN_LY") {
      return denyAccess();
    }

    // 2. Chặn truy cập các báo cáo/cài đặt nhạy cảm nếu là NHAN_VIEN
    const restrictedStaffRoutes = [
      "/nhan-vien/bao-cao/doanh-thu",
      "/nhan-vien/cai-dat/quy-dinh",
      "/nhan-vien/cai-dat/phan-quyen",
    ];

    if (restrictedStaffRoutes.some(route => pathname.startsWith(route)) && token?.role !== "QUAN_LY") {
      return denyAccess();
    }

    const staffPermissionRoutes = [
      { route: "/nhan-vien/danh-muc/san-pham", permission: "DM_SP" },
      { route: "/nhan-vien/danh-muc/khach-hang", permission: "DM_KH" },
      { route: "/nhan-vien/danh-muc/nha-cung-cap", permission: "DM_NCC" },
      { route: "/nhan-vien/danh-muc/don-vi-tinh", permission: "DM_DVT" },
      { route: "/nhan-vien/danh-muc/loai-san-pham", permission: "DM_LSP" },
      { route: "/nhan-vien/giao-dich/ban-hang", permission: "GD_BAN" },
      { route: "/nhan-vien/giao-dich/mua-hang", permission: "GD_MUA" },
      { route: "/nhan-vien/dich-vu/lap-phieu", permission: "DV_LAP" },
      { route: "/nhan-vien/dich-vu/tra-cuu", permission: "DV_TRA" },
      { route: "/nhan-vien/bao-cao/ton-kho", permission: "BC_TON" },
    ];

    const matchedStaffRoute = staffPermissionRoutes.find(item => pathname.startsWith(item.route));
    if (token?.role === "NHAN_VIEN" && matchedStaffRoute) {
      const viewPerm = `${matchedStaffRoute.permission}:XEM`;

      // Kiểm tra JWT — hỗ trợ cả format mới "DM_SP:XEM" và cũ "DM_SP"
      if (jwtPermissions.some((p: string) => p === viewPerm || p === matchedStaffRoute.permission)) {
        return; // Có quyền trong JWT → cho qua
      }

      // JWT không có quyền → gọi API route kiểm tra DB (real-time, admin vừa cấp quyền)
      // Không dùng Prisma trực tiếp vì Edge Runtime không hỗ trợ
      try {
        const apiUrl = new URL(`/api/auth/permissions-check`, req.url);
        apiUrl.searchParams.set("maNhom", token?.maNhom as string);
        apiUrl.searchParams.set("maChucNang", matchedStaffRoute.permission);
        apiUrl.searchParams.set("hanhDong", "XEM");
        const res = await fetch(apiUrl.toString());
        const data = await res.json();
        if (data.allowed) {
          return; // DB có quyền → cho qua (admin vừa cấp, JWT chưa cập nhật)
        }
      } catch (e) {
        console.error("[Middleware] DB permission check failed:", e);
      }

      return denyAccess();
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
