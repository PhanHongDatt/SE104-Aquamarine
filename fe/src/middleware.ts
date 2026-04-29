import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin") && token?.role !== "QUAN_LY") {
      return NextResponse.redirect(new URL("/dang-nhap", req.url));
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
