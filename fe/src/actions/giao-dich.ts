'use server';

import { prisma } from '@/lib/prisma';
import type { PhieuBanHang, PhieuMuaHang } from '@/types/model';
import { assertPurchaseQuantityMeetsMinimum, calculateLineTotal, calculateSellPrice, canSellQuantity } from '@/lib/business-rules';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { nextSequentialIdFromValidCodes, withUniqueRetry } from '@/lib/id-generation';
import { salesInvoiceSchema } from '@/schemas/giao-dich.schema';
import { purchaseInvoiceSchema } from '@/schemas/purchase.schema';

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function getReportDateParts(date: Date) {
  return {
    ngay: date.getDate(),
    thang: date.getMonth() + 1,
    nam: date.getFullYear(),
  };
}

async function upsertBaoCaoTonKho(
  tx: TransactionClient,
  params: {
    ngay: number;
    thang: number;
    nam: number;
    maSP: string;
    tonDau: number;
    slMuaVao?: number;
    slBanRa?: number;
  }
) {
  const slMuaVaoThem = params.slMuaVao ?? 0;
  const slBanRaThem = params.slBanRa ?? 0;

  const current = await tx.baoCaoTonKho.findUnique({
    where: {
      ngay_thang_nam_maSP: {
        ngay: params.ngay,
        thang: params.thang,
        nam: params.nam,
        maSP: params.maSP,
      },
    },
  });

  if (!current) {
    await tx.baoCaoTonKho.create({
      data: {
        ngay: params.ngay,
        thang: params.thang,
        nam: params.nam,
        maSP: params.maSP,
        tonDau: params.tonDau,
        slMuaVao: slMuaVaoThem,
        slBanRa: slBanRaThem,
        tonCuoi: params.tonDau + slMuaVaoThem - slBanRaThem,
      },
    });
    return;
  }

  const slMuaVao = current.slMuaVao + slMuaVaoThem;
  const slBanRa = current.slBanRa + slBanRaThem;

  await tx.baoCaoTonKho.update({
    where: {
      ngay_thang_nam_maSP: {
        ngay: params.ngay,
        thang: params.thang,
        nam: params.nam,
        maSP: params.maSP,
      },
    },
    data: {
      slMuaVao,
      slBanRa,
      tonCuoi: current.tonDau + slMuaVao - slBanRa,
    },
  });
}

async function generateSalesReceiptId(tx: TransactionClient) {
  const records = await tx.phieuBanHang.findMany({
    where: { soPhieu: { startsWith: "PBH" } },
    select: { soPhieu: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.soPhieu), "PBH", 7);
}

async function generatePurchaseReceiptId(tx: TransactionClient) {
  const records = await tx.phieuMuaHang.findMany({
    where: { soPhieu: { startsWith: "PMH" } },
    select: { soPhieu: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.soPhieu), "PMH", 7);
}

// ── Phiếu Bán Hàng ────────────────────────────────────────────
export async function getDanhSachPhieuBanHang(): Promise<PhieuBanHang[]> {
  const data = await prisma.phieuBanHang.findMany({
    include: {
      khachHang: true,
      chiTietBanHang: {
        include: {
          sanPham: {
            include: {
              loaiSanPham: true,
              donViTinh: true,
            },
          },
        },
      },
    },
    orderBy: { ngayLap: 'desc' }
  });
  return serialize(data);
}

export async function lapPhieuBanHang(
  data: Omit<PhieuBanHang, 'chiTietBanHang'> & {
    chiTietBanHang: { maSP: string; soLuong: number; donGia?: number; donGiaBan?: number; thanhTien: number }[];
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.BAN_HANG, session))) {
      return { success: false, message: "Bạn không có quyền lập phiếu bán hàng" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap as any) : new Date();
    const validated = salesInvoiceSchema.parse({ ...data, ngayLap });
    const reportDate = getReportDateParts(ngayLap);

    const result = await withUniqueRetry(() => prisma.$transaction(async (tx) => {
      const soPhieu = await generateSalesReceiptId(tx);
      const duplicatedProduct = validated.chiTietBanHang.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maSP === item.maSP) !== index
      );
      if (duplicatedProduct) {
        throw new Error(`Sản phẩm ${duplicatedProduct.maSP} bị nhập trùng trong phiếu bán`);
      }

      const khachHang = validated.maKH
        ? await tx.khachHang.findFirst({
            where: { maKH: validated.maKH, deletedAt: null },
            select: { maKH: true, hoTen: true },
          })
        : null;

      if (validated.maKH && !khachHang) {
        throw new Error("Khách hàng không hợp lệ");
      }

      const chiTietDaTinh = [];

      for (const ct of validated.chiTietBanHang) {
        const sp = await tx.sanPham.findUnique({
          where: { maSP: ct.maSP },
          include: { loaiSanPham: true, donViTinh: true },
        });
        if (!sp) throw new Error(`Sản phẩm ${ct.maSP} không tồn tại`);
        if (sp.deletedAt) throw new Error(`Sản phẩm ${ct.maSP} đã ngừng kinh doanh`);
        if (!canSellQuantity(sp.tonKho, ct.soLuong)) {
          throw new Error(`Sản phẩm ${sp.tenSP} (${ct.maSP}) không đủ tồn kho (Còn ${sp.tonKho})`);
        }

        const donGiaBan = calculateSellPrice(Number(sp.donGiaNhap), Number(sp.loaiSanPham.phanTramLoiNhuan));
        const thanhTien = calculateLineTotal(ct.soLuong, donGiaBan);
        chiTietDaTinh.push({
          maSP: ct.maSP,
          soLuong: ct.soLuong,
          donGia: donGiaBan,
          thanhTien,
          tonDau: sp.tonKho,
          tenSP: sp.tenSP,
        });
      }

      const tongTien = chiTietDaTinh.reduce((sum, ct) => sum + ct.thanhTien, 0);

      // 1. Tạo phiếu bán hàng
      const phieu = await tx.phieuBanHang.create({
        data: {
          soPhieu,
          ngayLap,
          maKH: khachHang?.maKH ?? null,
          tenKhachHang: khachHang?.hoTen ?? validated.tenKhachHang,
          tongTien,
          chiTietBanHang: {
            create: chiTietDaTinh.map(ct => ({
              maSP: ct.maSP,
              soLuong: ct.soLuong,
              donGia: ct.donGia,
              thanhTien: ct.thanhTien
            }))
          }
        }
      });

      // 2. Cập nhật tồn kho cho từng sản phẩm
      for (const ct of chiTietDaTinh) {
        await upsertBaoCaoTonKho(tx, {
          ...reportDate,
          maSP: ct.maSP,
          tonDau: ct.tonDau,
          slBanRa: ct.soLuong,
        });

        await tx.sanPham.update({
          where: { maSP: ct.maSP },
          data: { tonKho: { decrement: ct.soLuong } }
        });
      }

      await tx.baoCaoDoanhThu.upsert({
        where: {
          ngay_thang_nam: reportDate,
        },
        create: {
          ...reportDate,
          dtBanHang: tongTien,
          dtDichVu: 0,
          tongDT: tongTien,
        },
        update: {
          dtBanHang: { increment: tongTien },
          tongDT: { increment: tongTien },
        },
      });

      return phieu;
    }));

    return {
      success: true,
      message: "Lập phiếu bán hàng thành công",
      data: serialize(result)
    };
  } catch (error: any) {
    console.error("[lapPhieuBanHang] Error:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi lập phiếu bán hàng"
    };
  }
}

// ── Phiếu Mua Hàng ────────────────────────────────────────────
export async function getDanhSachPhieuMuaHang(): Promise<PhieuMuaHang[]> {
  const data = await prisma.phieuMuaHang.findMany({
    include: {
      nhaCungCap: true,
      chiTietMuaHang: {
        include: {
          sanPham: {
            include: {
              loaiSanPham: true,
              donViTinh: true,
            },
          },
        },
      },
    },
    orderBy: { ngayLap: 'desc' }
  });
  return serialize(data);
}

export async function lapPhieuMuaHang(
  data: Omit<PhieuMuaHang, 'nhaCungCap' | 'chiTietMuaHang'> & {
    chiTietMuaHang: { maSP: string; soLuong: number; donGiaMua: number; thanhTien: number }[];
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.MUA_HANG, session))) {
      return { success: false, message: "Bạn không có quyền lập phiếu mua hàng" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap as any) : new Date();
    const validated = purchaseInvoiceSchema.parse({ ...data, ngayLap });
    const reportDate = getReportDateParts(ngayLap);

    const result = await withUniqueRetry(() => prisma.$transaction(async (tx) => {
      const soPhieu = await generatePurchaseReceiptId(tx);
      const duplicatedProduct = validated.chiTietMuaHang.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maSP === item.maSP) !== index
      );
      if (duplicatedProduct) {
        throw new Error(`Sản phẩm ${duplicatedProduct.maSP} bị nhập trùng trong phiếu mua`);
      }

      const [nhaCungCap, thamSo] = await Promise.all([
        tx.nhaCungCap.findUnique({ where: { maNCC: validated.maNCC } }),
        tx.thamSo.findFirst({ where: { id: 1 } }),
      ]);

      if (!nhaCungCap) {
        throw new Error("Nhà cung cấp không hợp lệ");
      }

      const soLuongNhapToiThieu = thamSo?.soLuongNhapToiThieu ?? 1;
      const chiTietDaTinh = [];

      for (const ct of validated.chiTietMuaHang) {
        const sp = await tx.sanPham.findUnique({
          where: { maSP: ct.maSP },
          include: { loaiSanPham: true, donViTinh: true }
        });

        if (!sp) throw new Error(`Sản phẩm ${ct.maSP} không tồn tại`);
        if (sp.deletedAt) throw new Error(`Sản phẩm ${ct.maSP} đã ngừng kinh doanh`);
        assertPurchaseQuantityMeetsMinimum(sp.tenSP, ct.soLuong, soLuongNhapToiThieu);

        const thanhTien = calculateLineTotal(ct.soLuong, Number(ct.donGiaMua));
        const phanTramLN = Number(sp.loaiSanPham.phanTramLoiNhuan);
        const donGiaBanMoi = calculateSellPrice(Number(ct.donGiaMua), phanTramLN);

        chiTietDaTinh.push({
          maSP: ct.maSP,
          soLuong: ct.soLuong,
          donGiaMua: Number(ct.donGiaMua),
          thanhTien,
          tonDau: sp.tonKho,
          donGiaBanMoi,
        });
      }

      const tongTien = chiTietDaTinh.reduce((sum, ct) => sum + ct.thanhTien, 0);

      // 1. Tạo phiếu mua hàng
      const phieu = await tx.phieuMuaHang.create({
        data: {
          soPhieu,
          ngayLap,
          maNCC: validated.maNCC,
          tongTien,
          chiTietMuaHang: {
            create: chiTietDaTinh.map(ct => ({
              maSP: ct.maSP,
              soLuong: ct.soLuong,
              donGia: ct.donGiaMua,
              thanhTien: ct.thanhTien
            }))
          }
        }
      });

      // 2. Cập nhật từng sản phẩm
      for (const ct of chiTietDaTinh) {
        await upsertBaoCaoTonKho(tx, {
          ...reportDate,
          maSP: ct.maSP,
          tonDau: ct.tonDau,
          slMuaVao: ct.soLuong,
        });

        await tx.sanPham.update({
          where: { maSP: ct.maSP },
          data: {
            tonKho: { increment: ct.soLuong },
            donGiaNhap: ct.donGiaMua, // Cập nhật đơn giá nhập mới nhất
            donGiaBan: ct.donGiaBanMoi    // Cập nhật giá bán mới
          }
        });
      }

      return phieu;
    }));

    return {
      success: true,
      message: "Lập phiếu mua hàng thành công",
      data: serialize(result)
    };
  } catch (error: any) {
    console.error("[lapPhieuMuaHang] Error:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi lập phiếu mua hàng"
    };
  }
}
