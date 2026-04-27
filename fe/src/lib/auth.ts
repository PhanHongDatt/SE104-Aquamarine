import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

        // TODO: Replace with real API call to `be` service
        // e.g. const res = await fetch("http://be:8080/api/auth/login", { ... })
        const mockUsers = [
          {
            id: "1",
            name: "Nguyễn Quản Lý",
            email: "admin@vangbac.vn",
            username: "admin",
            password: "Admin@123",
            role: "QUAN_LY" as const,
            maNhom: "NQ001",
          },
          {
            id: "2",
            name: "Trần Nhân Viên",
            email: "nhanvien@vangbac.vn",
            username: "nhanvien",
            password: "Nhanvien@1",
            role: "NHAN_VIEN" as const,
            maNhom: "NV001",
          },
        ];

        const user = mockUsers.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          maNhom: user.maNhom,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.maNhom = user.maNhom;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.maNhom = token.maNhom;
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
