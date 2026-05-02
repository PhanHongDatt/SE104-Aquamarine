import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // 1. Chặn truy cập Admin nếu không phải QUAN_LY
    if (pathname.startsWith("/admin") && token?.role !== "QUAN_LY") {
      return NextResponse.redirect(new URL("/nhan-vien", req.url));
    }

    // 2. Chặn truy cập các báo cáo/cài đặt nhạy cảm nếu là NHAN_VIEN
    const restrictedStaffRoutes = [
      "/nhan-vien/bao-cao/doanh-thu",
      "/nhan-vien/cai-dat/quy-dinh",
      "/nhan-vien/cai-dat/phan-quyen",
    ];

    if (restrictedStaffRoutes.some(route => pathname.startsWith(route)) && token?.role !== "QUAN_LY") {
      return NextResponse.redirect(new URL("/nhan-vien", req.url));
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
    "/((?!dang-nhap|api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
