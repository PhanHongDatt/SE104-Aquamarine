import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint kiểm tra quyền real-time từ DB.
 * Được gọi bởi middleware khi JWT không có quyền (fallback check).
 * GET /api/auth/permissions-check?maNhom=NHANVI&maChucNang=DM_DVT&hanhDong=XEM
 */
export async function GET(req: NextRequest) {
  try {
    const maNhom = req.nextUrl.searchParams.get("maNhom");
    const maChucNang = req.nextUrl.searchParams.get("maChucNang");
    const hanhDong = req.nextUrl.searchParams.get("hanhDong") || "XEM";

    if (!maNhom || !maChucNang) {
      return NextResponse.json({ allowed: false, error: "Missing params" }, { status: 400 });
    }

    // CHAR(4) padding: DB lưu "XEM " (4 chars) nên cần pad input
    const paddedHanhDong = hanhDong.padEnd(4);
    const record = await prisma.bangPhanQuyen.findUnique({
      where: {
        maNhom_maChucNang_hanhDong: { maNhom, maChucNang, hanhDong: paddedHanhDong },
      },
    });

    return NextResponse.json({ allowed: !!record });
  } catch (error) {
    console.error("[permissions-check] DB error:", error);
    return NextResponse.json({ allowed: false, error: "DB error" }, { status: 500 });
  }
}
