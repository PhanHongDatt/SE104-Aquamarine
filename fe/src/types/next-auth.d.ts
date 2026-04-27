import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "QUAN_LY" | "NHAN_VIEN";
      maNhom: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "QUAN_LY" | "NHAN_VIEN";
    maNhom: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "QUAN_LY" | "NHAN_VIEN";
    maNhom: string;
  }
}
