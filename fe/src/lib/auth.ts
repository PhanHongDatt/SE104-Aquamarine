import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { MANAGER_GROUP_CODE } from "@/lib/permissions";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === "production" && !nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required in production. Generate one with: openssl rand -base64 32");
}

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

const DEFAULT_MANAGER_PERMISSIONS = [
  "DM_DVT:XEM", "DM_DVT:THEM", "DM_DVT:SUA", "DM_DVT:XOA",
  "DM_LSP:XEM", "DM_LSP:THEM", "DM_LSP:SUA", "DM_LSP:XOA",
  "DM_SP:XEM", "DM_SP:THEM", "DM_SP:SUA", "DM_SP:XOA",
  "DM_KH:XEM", "DM_KH:THEM", "DM_KH:SUA", "DM_KH:XOA",
  "DM_NCC:XEM", "DM_NCC:THEM", "DM_NCC:SUA", "DM_NCC:XOA",
  "GD_BAN:XEM", "GD_BAN:THEM",
  "GD_MUA:XEM", "GD_MUA:THEM",
  "DV_LAP:XEM", "DV_LAP:THEM",
  "DV_LDV:XEM", "DV_LDV:THEM", "DV_LDV:SUA", "DV_LDV:XOA",
  "DV_TRA:XEM", "DV_TRA:SUA",
  "BC_TON:XEM", "BC_DTH:XEM",
  "HT_USR:XEM", "HT_USR:THEM", "HT_USR:SUA", "HT_USR:XOA",
  "HT_PHQ:XEM", "HT_PHQ:SUA",
  "HT_QDI:XEM", "HT_QDI:SUA",
  "HT_BAK:XEM", "HT_BAK:THEM", "HT_BAK:SUA",
];
const DEFAULT_STAFF_PERMISSIONS = [
  "DM_DVT:XEM",
  "DM_LSP:XEM",
  "DM_SP:XEM", "DM_SP:THEM", "DM_SP:SUA",
  "DM_KH:XEM", "DM_KH:THEM", "DM_KH:SUA",
  "DM_NCC:XEM",
  "GD_BAN:XEM", "GD_BAN:THEM",
  "GD_MUA:XEM", "GD_MUA:THEM",
  "DV_LAP:XEM", "DV_LAP:THEM",
  "DV_TRA:XEM", "DV_TRA:SUA",
  "BC_TON:XEM",
];

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
              select: { maChucNang: true, hanhDong: true },
            });

            const role = user.maNhom.trim() === MANAGER_GROUP_CODE
              ? "QUAN_LY"
              : user.nhomNguoiDung.tenNhom as string;
            // Lưu quyền dạng "maChucNang:hanhDong" (VD: "DM_SP:XEM")
            // Nhóm custom không có quyền trong DB → trả rỗng (không fallback staff)
            const permissionCodes = permissions.length > 0
              ? permissions.map((p) => `${p.maChucNang.trim()}:${p.hanhDong.trim()}`)
              : user.maNhom.trim() === MANAGER_GROUP_CODE ? DEFAULT_MANAGER_PERMISSIONS : [];

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
        sessionUser.role = token.role as string;
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
