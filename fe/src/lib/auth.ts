import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const user = await prisma.nguoiDung.findUnique({
            where: { tenDangNhap: credentials.username },
            include: { nhomNguoiDung: true },
          });

          // Lưu ý: Đang dùng plain text password theo yêu cầu thử nghiệm nhanh
          if (user && user.matKhau === credentials.password) {
            const role = user.nhomNguoiDung.tenNhom as "QUAN_LY" | "NHAN_VIEN";
            return {
              id: user.maND,
              name: user.hoTen,
              email: `${user.tenDangNhap}@vangbac.local`,
              role,
              maNhom: user.maNhom,
            };
          }
        } catch (error) {
          console.error("[Auth] Database error:", error);
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.maNhom = (user as any).maNhom;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as any;
        session.user.maNhom = token.maNhom as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/dang-nhap",
    error: "/dang-nhap",
  },
  secret: process.env.NEXTAUTH_SECRET || "vangbac-secret-local-dev",
};
