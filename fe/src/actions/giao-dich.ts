'use server';

import { prisma } from '@/lib/prisma';
import type { PhieuBanHang, PhieuMuaHang } from '@/types/model';
import {
  calculateLineTotal,
  calculateSellPrice,
  canSellQuantity,
} from '@/lib/business-rules';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasPermission, PERMISSIONS, ACTIONS } from '@/lib/permissions';
import { nextSequentialIdFromValidCodes, withUniqueRetry } from '@/lib/id-generation';
import { salesInvoiceSchema } from '@/schemas/giao-dich.schema';
import { purchaseInvoiceSchema } from '@/schemas/purchase.schema';
import { revalidatePath } from 'next/cache';
import { getBusinessDateParts } from '@/lib/business-date';
import { syncBaoCaoDoanhThuForDate } from '@/lib/revenue-report-sync';

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function getReportDateParts(date: Date) {
  return getBusinessDateParts(date);
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

async function decrementBaoCaoMuaVao(
  tx: TransactionClient,
  params: {
    ngay: number;
    thang: number;
    nam: number;
    maSP: string;
    soLuong: number;
  }
) {
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

  if (!current) return;

  const slMuaVao = Math.max(0, current.slMuaVao - params.soLuong);
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
      tonCuoi: current.tonDau + slMuaVao - current.slBanRa,
    },
  });
}

async function decrementBaoCaoBanRa(
  tx: TransactionClient,
  params: {
    ngay: number;
    thang: number;
    nam: number;
    maSP: string;
    soLuong: number;
  }
) {
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

  if (!current) return;

  const slBanRa = Math.max(0, current.slBanRa - params.soLuong);
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
      slBanRa,
      tonCuoi: current.tonDau + current.slMuaVao - slBanRa,
    },
  });
}

async function decrementBaoCaoDoanhThuBanHang(
  tx: TransactionClient,
  params: { ngay: number; thang: number; nam: number; soTien: number }
) {
  const current = await tx.baoCaoDoanhThu.findUnique({
    where: { ngay_thang_nam: { ngay: params.ngay, thang: params.thang, nam: params.nam } },
  });

  if (!current) return;

  const dtBanHang = Math.max(0, Number(current.dtBanHang) - params.soTien);
  const tongDT = Math.max(0, Number(current.tongDT) - params.soTien);

  await tx.baoCaoDoanhThu.update({
    where: { ngay_thang_nam: { ngay: params.ngay, thang: params.thang, nam: params.nam } },
    data: { dtBanHang, tongDT },
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
  const session = await getServerSession(authOptions) as any;
  if (!(await hasPermission(PERMISSIONS.BAN_HANG, ACTIONS.VIEW, session))) {
    throw new Error("Bạn không có quyền xem phiếu bán hàng");
  }
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
    if (!(await hasPermission(PERMISSIONS.BAN_HANG, ACTIONS.CREATE, session))) {
      return { success: false, message: "Bạn không có quyền lập phiếu bán hàng" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap as any) : new Date();
    const validated = salesInvoiceSchema.parse({ ...data, ngayLap });
    const reportDate = getReportDateParts(ngayLap);
    if (!validated.maKH?.trim() && !validated.soDienThoai?.trim()) {
      return { success: false, message: "Vui lòng nhập số điện thoại cho khách hàng mới" };
    }

    const result = await withUniqueRetry(() => prisma.$transaction(async (tx) => {
      const soPhieu = await generateSalesReceiptId(tx);
      const duplicatedProduct = validated.chiTietBanHang.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maSP === item.maSP) !== index
      );
      if (duplicatedProduct) {
        throw new Error(`Sản phẩm ${duplicatedProduct.maSP} bị nhập trùng trong phiếu bán`);
      }

      let khachHang = validated.maKH
        ? await tx.khachHang.findFirst({
            where: { maKH: validated.maKH, deletedAt: null },
            select: { maKH: true, hoTen: true },
          })
        : null;

      if (validated.maKH && !khachHang) {
        throw new Error("Khách hàng không hợp lệ");
      }

      // Nếu chưa chọn KH có sẵn nhưng có SĐT → tìm hoặc tạo mới
      if (!khachHang && validated.soDienThoai && validated.soDienThoai.trim()) {
        const sdt = validated.soDienThoai.trim();
        const existing = await tx.khachHang.findFirst({
          where: { soDienThoai: sdt, deletedAt: null },
          select: { maKH: true, hoTen: true },
        });
        if (existing) {
          khachHang = existing;
        } else {
          // Tạo khách hàng mới
          const lastKH = await tx.khachHang.findFirst({
            orderBy: { maKH: "desc" },
            select: { maKH: true },
          });
          const nextNum = lastKH ? parseInt(lastKH.maKH.replace("KH", ""), 10) + 1 : 1;
          const newMaKH = `KH${nextNum.toString().padStart(4, "0")}`;
          const newKH = await tx.khachHang.create({
            data: {
              maKH: newMaKH,
              hoTen: validated.tenKhachHang,
              soDienThoai: sdt,
            },
            select: { maKH: true, hoTen: true },
          });
          khachHang = newKH;
        }
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

export async function deletePhieuBanHang(soPhieu: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.BAN_HANG, ACTIONS.DELETE, session))) {
      return { success: false, message: "Bạn không có quyền xóa phiếu bán hàng" };
    }

    await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieuBanHang.findUnique({
        where: { soPhieu },
        include: { chiTietBanHang: true },
      });

      if (!phieu) {
        throw new Error("Phiếu bán hàng không tồn tại");
      }

      const reportDate = getReportDateParts(new Date(phieu.ngayLap));

      for (const ct of phieu.chiTietBanHang) {
        await decrementBaoCaoBanRa(tx, {
          ...reportDate,
          maSP: ct.maSP,
          soLuong: ct.soLuong,
        });

        await tx.sanPham.update({
          where: { maSP: ct.maSP },
          data: { tonKho: { increment: ct.soLuong } },
        });
      }

      await decrementBaoCaoDoanhThuBanHang(tx, {
        ...reportDate,
        soTien: Number(phieu.tongTien),
      });

      await tx.chiTietBanHang.deleteMany({ where: { soPhieu } });
      await tx.phieuBanHang.delete({ where: { soPhieu } });
    });

    revalidatePath("/admin/giao-dich/ban-hang");
    revalidatePath("/nhan-vien/giao-dich/ban-hang");
    revalidatePath("/admin/bao-cao/ton-kho");
    revalidatePath("/nhan-vien/bao-cao/ton-kho");
    revalidatePath("/admin/bao-cao/doanh-thu");
    revalidatePath("/nhan-vien/bao-cao/doanh-thu");
    return { success: true, message: "Xóa phiếu bán hàng thành công và đã hoàn tác tồn kho/doanh thu" };
  } catch (error: any) {
    console.error("[deletePhieuBanHang] Error:", error);
    return { success: false, message: error.message || "Lỗi khi xóa phiếu bán hàng" };
  }
}

export async function updatePhieuBanHang(
  soPhieu: string,
  data: Omit<PhieuBanHang, 'chiTietBanHang'> & {
    chiTietBanHang: { maSP: string; soLuong: number; donGia?: number; donGiaBan?: number; thanhTien: number }[];
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.BAN_HANG, ACTIONS.UPDATE, session))) {
      return { success: false, message: "Bạn không có quyền sửa phiếu bán hàng" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap as any) : new Date();
    const validated = salesInvoiceSchema.parse({ ...data, soPhieu, ngayLap });

    const result = await prisma.$transaction(async (tx) => {
      const currentReceipt = await tx.phieuBanHang.findUnique({
        where: { soPhieu },
        include: { chiTietBanHang: true },
      });
      if (!currentReceipt) {
        throw new Error("Phiếu bán hàng không tồn tại");
      }

      const duplicatedProduct = validated.chiTietBanHang.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maSP === item.maSP) !== index
      );
      if (duplicatedProduct) {
        throw new Error(`Sản phẩm ${duplicatedProduct.maSP} bị nhập trùng trong phiếu bán`);
      }

      const oldReportDate = getReportDateParts(new Date(currentReceipt.ngayLap));

      // Hoàn tác chi tiết cũ trước để tồn kho khả dụng bao gồm số lượng đã bán trong phiếu này.
      for (const oldLine of currentReceipt.chiTietBanHang) {
        await decrementBaoCaoBanRa(tx, {
          ...oldReportDate,
          maSP: oldLine.maSP,
          soLuong: oldLine.soLuong,
        });

        await tx.sanPham.update({
          where: { maSP: oldLine.maSP },
          data: { tonKho: { increment: oldLine.soLuong } },
        });
      }

      let khachHang = validated.maKH
        ? await tx.khachHang.findFirst({
            where: { maKH: validated.maKH, deletedAt: null },
            select: { maKH: true, hoTen: true },
          })
        : null;

      if (validated.maKH && !khachHang) {
        throw new Error("Khách hàng không hợp lệ");
      }

      if (!khachHang && validated.soDienThoai && validated.soDienThoai.trim()) {
        const sdt = validated.soDienThoai.trim();
        const existing = await tx.khachHang.findFirst({
          where: { soDienThoai: sdt, deletedAt: null },
          select: { maKH: true, hoTen: true },
        });
        if (existing) {
          khachHang = existing;
        } else {
          const lastKH = await tx.khachHang.findFirst({
            orderBy: { maKH: "desc" },
            select: { maKH: true },
          });
          const nextNum = lastKH ? parseInt(lastKH.maKH.replace("KH", ""), 10) + 1 : 1;
          const newMaKH = `KH${nextNum.toString().padStart(4, "0")}`;
          khachHang = await tx.khachHang.create({
            data: {
              maKH: newMaKH,
              hoTen: validated.tenKhachHang,
              soDienThoai: sdt,
            },
            select: { maKH: true, hoTen: true },
          });
        }
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
        });
      }

      const tongTien = chiTietDaTinh.reduce((sum, ct) => sum + ct.thanhTien, 0);
      const reportDate = getReportDateParts(ngayLap);

      await tx.chiTietBanHang.deleteMany({ where: { soPhieu } });
      const updated = await tx.phieuBanHang.update({
        where: { soPhieu },
        data: {
          ngayLap,
          maKH: khachHang?.maKH ?? null,
          tenKhachHang: khachHang?.hoTen ?? validated.tenKhachHang,
          tongTien,
          chiTietBanHang: {
            create: chiTietDaTinh.map((ct) => ({
              maSP: ct.maSP,
              soLuong: ct.soLuong,
              donGia: ct.donGia,
              thanhTien: ct.thanhTien,
            })),
          },
        },
      });

      for (const ct of chiTietDaTinh) {
        await upsertBaoCaoTonKho(tx, {
          ...reportDate,
          maSP: ct.maSP,
          tonDau: ct.tonDau,
          slBanRa: ct.soLuong,
        });

        await tx.sanPham.update({
          where: { maSP: ct.maSP },
          data: { tonKho: { decrement: ct.soLuong } },
        });
      }

      await syncBaoCaoDoanhThuForDate(tx, new Date(currentReceipt.ngayLap));
      if (oldReportDate.ngay !== reportDate.ngay || oldReportDate.thang !== reportDate.thang || oldReportDate.nam !== reportDate.nam) {
        await syncBaoCaoDoanhThuForDate(tx, ngayLap);
      }

      return updated;
    });

    revalidatePath("/admin/giao-dich/ban-hang");
    revalidatePath("/nhan-vien/giao-dich/ban-hang");
    revalidatePath("/admin/bao-cao/ton-kho");
    revalidatePath("/nhan-vien/bao-cao/ton-kho");
    revalidatePath("/admin/bao-cao/doanh-thu");
    revalidatePath("/nhan-vien/bao-cao/doanh-thu");
    return { success: true, message: "Cập nhật phiếu bán hàng thành công", data: serialize(result) };
  } catch (error: any) {
    console.error("[updatePhieuBanHang] Error:", error);
    return { success: false, message: error.message || "Lỗi khi sửa phiếu bán hàng" };
  }
}

// ── Phiếu Mua Hàng ────────────────────────────────────────────
export async function getDanhSachPhieuMuaHang(): Promise<PhieuMuaHang[]> {
  const session = await getServerSession(authOptions) as any;
  if (!(await hasPermission(PERMISSIONS.MUA_HANG, ACTIONS.VIEW, session))) {
    throw new Error("Bạn không có quyền xem phiếu mua hàng");
  }
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
    if (!(await hasPermission(PERMISSIONS.MUA_HANG, ACTIONS.CREATE, session))) {
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

      const nhaCungCap = await tx.nhaCungCap.findFirst({
        where: { maNCC: validated.maNCC, deletedAt: null },
      });

      if (!nhaCungCap) {
        throw new Error("Nhà cung cấp không hợp lệ");
      }

      const chiTietDaTinh = [];

      for (const ct of validated.chiTietMuaHang) {
        const sp = await tx.sanPham.findUnique({
          where: { maSP: ct.maSP },
          include: { loaiSanPham: true, donViTinh: true }
        });

        if (!sp) throw new Error(`Sản phẩm ${ct.maSP} không tồn tại`);
        if (sp.deletedAt) throw new Error(`Sản phẩm ${ct.maSP} đã ngừng kinh doanh`);

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

export async function deletePhieuMuaHang(soPhieu: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.MUA_HANG, ACTIONS.DELETE, session))) {
      return { success: false, message: "Bạn không có quyền xóa phiếu mua hàng" };
    }

    await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieuMuaHang.findUnique({
        where: { soPhieu },
        include: { chiTietMuaHang: true },
      });
      if (!phieu) {
        throw new Error("Phiếu mua hàng không tồn tại");
      }

      const currentProducts = await Promise.all(
        phieu.chiTietMuaHang.map((ct) =>
          tx.sanPham.findUnique({
            where: { maSP: ct.maSP },
            include: { loaiSanPham: true },
          })
        )
      );
      const productById = new Map(currentProducts.filter(Boolean).map((product) => [product!.maSP, product!]));

      for (const ct of phieu.chiTietMuaHang) {
        const product = productById.get(ct.maSP);
        if (!product) throw new Error(`Sản phẩm ${ct.maSP} không tồn tại`);
        if (product.tonKho < ct.soLuong) {
          throw new Error(
            `Không thể xóa phiếu mua: tồn hiện tại của ${product.tenSP} chỉ còn ${product.tonKho}, nhỏ hơn số lượng nhập ${ct.soLuong}`
          );
        }
      }

      const reportDate = getReportDateParts(new Date(phieu.ngayLap));

      for (const ct of phieu.chiTietMuaHang) {
        const product = productById.get(ct.maSP)!;
        await decrementBaoCaoMuaVao(tx, {
          ...reportDate,
          maSP: ct.maSP,
          soLuong: ct.soLuong,
        });

        const latestReceipt = await tx.phieuMuaHang.findFirst({
          where: {
            soPhieu: { not: soPhieu },
            chiTietMuaHang: { some: { maSP: ct.maSP } },
          },
          include: {
            chiTietMuaHang: {
              where: { maSP: ct.maSP },
              take: 1,
            },
          },
          orderBy: [{ ngayLap: "desc" }, { createdAt: "desc" }],
        });
        const latestPurchaseLine = latestReceipt?.chiTietMuaHang[0];
        const nextImportPrice = latestPurchaseLine ? Number(latestPurchaseLine.donGia) : Number(product.donGiaNhap);
        const nextSellPrice = calculateSellPrice(nextImportPrice, Number(product.loaiSanPham.phanTramLoiNhuan));

        await tx.sanPham.update({
          where: { maSP: ct.maSP },
          data: {
            tonKho: { decrement: ct.soLuong },
            donGiaNhap: nextImportPrice,
            donGiaBan: nextSellPrice,
          },
        });
      }

      await tx.chiTietMuaHang.deleteMany({ where: { soPhieu } });
      await tx.phieuMuaHang.delete({ where: { soPhieu } });
    });

    revalidatePath("/admin/giao-dich/mua-hang");
    revalidatePath("/nhan-vien/giao-dich/mua-hang");
    revalidatePath("/admin/bao-cao/ton-kho");
    revalidatePath("/nhan-vien/bao-cao/ton-kho");
    return { success: true, message: "Xóa phiếu mua hàng thành công và đã cập nhật tồn kho" };
  } catch (error: any) {
    console.error("[deletePhieuMuaHang] Error:", error);
    return { success: false, message: error.message || "Lỗi khi xóa phiếu mua hàng" };
  }
}

export async function updatePhieuMuaHang(
  soPhieu: string,
  data: Omit<PhieuMuaHang, 'nhaCungCap' | 'chiTietMuaHang'> & {
    chiTietMuaHang: { maSP: string; soLuong: number; donGiaMua: number; thanhTien: number }[];
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.MUA_HANG, ACTIONS.UPDATE, session))) {
      return { success: false, message: "Bạn không có quyền sửa phiếu mua hàng" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap as any) : new Date();
    const validated = purchaseInvoiceSchema.parse({ ...data, soPhieu, ngayLap });

    const result = await prisma.$transaction(async (tx) => {
      const currentReceipt = await tx.phieuMuaHang.findUnique({
        where: { soPhieu },
        include: { chiTietMuaHang: true },
      });
      if (!currentReceipt) {
        throw new Error("Phiếu mua hàng không tồn tại");
      }

      const duplicatedProduct = validated.chiTietMuaHang.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maSP === item.maSP) !== index
      );
      if (duplicatedProduct) {
        throw new Error(`Sản phẩm ${duplicatedProduct.maSP} bị nhập trùng trong phiếu mua`);
      }

      const nhaCungCap = await tx.nhaCungCap.findFirst({
        where: { maNCC: validated.maNCC, deletedAt: null },
      });
      if (!nhaCungCap) {
        throw new Error("Nhà cung cấp không hợp lệ");
      }

      const oldQtyByProduct = new Map<string, number>();
      for (const oldLine of currentReceipt.chiTietMuaHang) {
        oldQtyByProduct.set(oldLine.maSP, (oldQtyByProduct.get(oldLine.maSP) ?? 0) + oldLine.soLuong);
      }

      const newQtyByProduct = new Map<string, number>();
      for (const newLine of validated.chiTietMuaHang) {
        newQtyByProduct.set(newLine.maSP, (newQtyByProduct.get(newLine.maSP) ?? 0) + Number(newLine.soLuong));
      }

      const affectedProductIds = Array.from(new Set([
        ...oldQtyByProduct.keys(),
        ...newQtyByProduct.keys(),
      ]));
      const products = await tx.sanPham.findMany({
        where: { maSP: { in: affectedProductIds } },
        include: { loaiSanPham: true, donViTinh: true },
      });
      const productById = new Map(products.map((product) => [product.maSP, product]));

      for (const productId of affectedProductIds) {
        if (!productById.has(productId)) {
          throw new Error(`Sản phẩm ${productId} không tồn tại`);
        }
      }

      for (const newLine of validated.chiTietMuaHang) {
        const product = productById.get(newLine.maSP)!;
        if (product.deletedAt) {
          throw new Error(`Sản phẩm ${product.tenSP} (${product.maSP}) đã ngừng kinh doanh`);
        }
      }

      for (const productId of affectedProductIds) {
        const product = productById.get(productId)!;
        const oldQty = oldQtyByProduct.get(productId) ?? 0;
        const newQty = newQtyByProduct.get(productId) ?? 0;
        const finalStock = product.tonKho - oldQty + newQty;
        if (finalStock < 0) {
          throw new Error(
            `Không thể sửa phiếu mua: tồn hiện tại của ${product.tenSP} chỉ còn ${product.tonKho}, không đủ để giảm/xóa ${oldQty - newQty} sản phẩm`
          );
        }
      }

      const chiTietDaTinh = validated.chiTietMuaHang.map((ct) => {
        const donGiaMua = Number(ct.donGiaMua);
        return {
          maSP: ct.maSP,
          soLuong: Number(ct.soLuong),
          donGiaMua,
          thanhTien: calculateLineTotal(Number(ct.soLuong), donGiaMua),
        };
      });
      const tongTien = chiTietDaTinh.reduce((sum, ct) => sum + ct.thanhTien, 0);

      const oldReportDate = getReportDateParts(new Date(currentReceipt.ngayLap));
      for (const oldLine of currentReceipt.chiTietMuaHang) {
        await decrementBaoCaoMuaVao(tx, {
          ...oldReportDate,
          maSP: oldLine.maSP,
          soLuong: oldLine.soLuong,
        });
      }

      await tx.chiTietMuaHang.deleteMany({ where: { soPhieu } });
      const updated = await tx.phieuMuaHang.update({
        where: { soPhieu },
        data: {
          ngayLap,
          maNCC: validated.maNCC,
          tongTien,
          chiTietMuaHang: {
            create: chiTietDaTinh.map((ct) => ({
              maSP: ct.maSP,
              soLuong: ct.soLuong,
              donGia: ct.donGiaMua,
              thanhTien: ct.thanhTien,
            })),
          },
        },
      });

      const reportDate = getReportDateParts(ngayLap);
      for (const newLine of chiTietDaTinh) {
        const product = productById.get(newLine.maSP)!;
        const oldQty = oldQtyByProduct.get(newLine.maSP) ?? 0;
        await upsertBaoCaoTonKho(tx, {
          ...reportDate,
          maSP: newLine.maSP,
          tonDau: Math.max(0, product.tonKho - oldQty),
          slMuaVao: newLine.soLuong,
        });
      }

      for (const productId of affectedProductIds) {
        const product = productById.get(productId)!;
        const oldQty = oldQtyByProduct.get(productId) ?? 0;
        const newQty = newQtyByProduct.get(productId) ?? 0;
        await tx.sanPham.update({
          where: { maSP: productId },
          data: { tonKho: product.tonKho - oldQty + newQty },
        });
      }

      for (const productId of affectedProductIds) {
        const product = productById.get(productId)!;
        const latestReceipt = await tx.phieuMuaHang.findFirst({
          where: {
            chiTietMuaHang: { some: { maSP: productId } },
          },
          include: {
            chiTietMuaHang: {
              where: { maSP: productId },
              take: 1,
            },
          },
          orderBy: [{ ngayLap: "desc" }, { createdAt: "desc" }],
        });
        const latestPurchaseLine = latestReceipt?.chiTietMuaHang[0];
        const nextImportPrice = latestPurchaseLine ? Number(latestPurchaseLine.donGia) : Number(product.donGiaNhap);
        const nextSellPrice = calculateSellPrice(nextImportPrice, Number(product.loaiSanPham.phanTramLoiNhuan));

        await tx.sanPham.update({
          where: { maSP: productId },
          data: {
            donGiaNhap: nextImportPrice,
            donGiaBan: nextSellPrice,
          },
        });
      }

      return updated;
    });

    revalidatePath("/admin/giao-dich/mua-hang");
    revalidatePath("/nhan-vien/giao-dich/mua-hang");
    revalidatePath("/admin/bao-cao/ton-kho");
    revalidatePath("/nhan-vien/bao-cao/ton-kho");
    return { success: true, message: "Cập nhật phiếu mua hàng thành công", data: serialize(result) };
  } catch (error: any) {
    console.error("[updatePhieuMuaHang] Error:", error);
    return { success: false, message: error.message || "Lỗi khi sửa phiếu mua hàng" };
  }
}

export async function updatePhieuMuaHangGia(
  soPhieu: string,
  lines: { maSP: string; donGiaMua: number }[]
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.MUA_HANG, ACTIONS.UPDATE, session))) {
      return { success: false, message: "Bạn không có quyền sửa phiếu mua hàng" };
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return { success: false, message: "Phiếu mua phải có ít nhất một dòng sản phẩm" };
    }

    await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieuMuaHang.findUnique({
        where: { soPhieu },
        include: {
          chiTietMuaHang: {
            include: {
              sanPham: {
                include: { loaiSanPham: true },
              },
            },
          },
        },
      });

      if (!phieu) {
        throw new Error("Phiếu mua hàng không tồn tại");
      }

      const existingProductIds = new Set(phieu.chiTietMuaHang.map((ct) => ct.maSP));
      const incomingProductIds = new Set(lines.map((line) => line.maSP));
      if (existingProductIds.size !== incomingProductIds.size) {
        throw new Error("Không được thêm hoặc bớt sản phẩm khi sửa giá phiếu mua");
      }

      for (const productId of existingProductIds) {
        if (!incomingProductIds.has(productId)) {
          throw new Error("Không được đổi sản phẩm khi sửa giá phiếu mua");
        }
      }

      const priceByProduct = new Map<string, number>();
      for (const line of lines) {
        const price = Number(line.donGiaMua);
        if (!Number.isFinite(price) || price <= 0) {
          throw new Error("Đơn giá mua phải lớn hơn 0");
        }
        priceByProduct.set(line.maSP, Math.round(price));
      }

      let tongTien = 0;
      for (const ct of phieu.chiTietMuaHang) {
        const donGiaMua = priceByProduct.get(ct.maSP);
        if (!donGiaMua) {
          throw new Error(`Thiếu giá nhập cho sản phẩm ${ct.maSP}`);
        }

        const thanhTien = calculateLineTotal(ct.soLuong, donGiaMua);
        tongTien += thanhTien;

        await tx.chiTietMuaHang.update({
          where: {
            soPhieu_maSP: {
              soPhieu,
              maSP: ct.maSP,
            },
          },
          data: {
            donGia: donGiaMua,
            thanhTien,
          },
        });

        const latestReceipt = await tx.phieuMuaHang.findFirst({
          where: {
            chiTietMuaHang: { some: { maSP: ct.maSP } },
          },
          include: {
            chiTietMuaHang: {
              where: { maSP: ct.maSP },
              take: 1,
            },
          },
          orderBy: [{ ngayLap: "desc" }, { createdAt: "desc" }],
        });

        if (latestReceipt?.soPhieu === soPhieu) {
          const donGiaBan = calculateSellPrice(donGiaMua, Number(ct.sanPham.loaiSanPham.phanTramLoiNhuan));
          await tx.sanPham.update({
            where: { maSP: ct.maSP },
            data: {
              donGiaNhap: donGiaMua,
              donGiaBan,
            },
          });
        }
      }

      await tx.phieuMuaHang.update({
        where: { soPhieu },
        data: { tongTien },
      });
    });

    revalidatePath("/admin/giao-dich/mua-hang");
    revalidatePath("/nhan-vien/giao-dich/mua-hang");
    return { success: true, message: "Cập nhật giá nhập phiếu mua thành công" };
  } catch (error: any) {
    console.error("[updatePhieuMuaHangGia] Error:", error);
    return { success: false, message: error.message || "Lỗi khi sửa giá phiếu mua hàng" };
  }
}
