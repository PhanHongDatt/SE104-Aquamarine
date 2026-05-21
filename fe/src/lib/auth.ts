import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === "production" && !nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required in production. Generate one with: openssl rand -base64 32");
}

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

const DEFAULT_MANAGER_PERMISSIONS = [
  "DM_DVT", "DM_LSP", "DM_SP", "DM_KH", "DM_NCC", "GD_BAN", "GD_MUA",
  "DV_LAP", "DV_TRA", "BC_TON", "BC_DTH", "HT_USR", "HT_PHQ", "HT_QDI", "HT_BAK",
];
const DEFAULT_STAFF_PERMISSIONS = ["DM_SP", "DM_KH", "GD_BAN", "DV_LAP", "DV_TRA", "BC_TON"];

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

          if (!user) return null;

          const passwordMatches = isBcryptHash(user.matKhau)
            ? await bcrypt.compare(credentials.password, user.matKhau)
            : user.matKhau === credentials.password;

          if (passwordMatches) {
            if (!isBcryptHash(user.matKhau)) {
              // Migration: legacy plaintext passwords are re-hashed after the first successful login.
              await prisma.nguoiDung.update({
                where: { maND: user.maND },
                data: { matKhau: await bcrypt.hash(credentials.password, 10) },
              });
            }

            const permissions = await prisma.bangPhanQuyen.findMany({
              where: { maNhom: user.maNhom },
              select: { maChucNang: true },
            });

            const role = user.nhomNguoiDung.tenNhom as "QUAN_LY" | "NHAN_VIEN";
            const permissionCodes = permissions.length > 0
              ? permissions.map((p) => p.maChucNang)
              : role === "QUAN_LY" ? DEFAULT_MANAGER_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS;

            return {
              id: user.maND,
              name: user.hoTen,
              email: `${user.tenDangNhap}@vangbac.local`,
              role,
              maNhom: user.maNhom,
              permissions: permissionCodes,
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
        token.permissions = (user as any).permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const sessionUser = session.user as any;
        sessionUser.id = token.sub as string;
        sessionUser.role = token.role as any;
        sessionUser.maNhom = token.maNhom as any;
        sessionUser.permissions = (token.permissions as string[]) ?? [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/dang-nhap",
    error: "/dang-nhap",
  },
  secret: nextAuthSecret,
};
