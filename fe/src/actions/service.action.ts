'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateLineTotal,
  calculateRemainingAmount,
  calculateServiceUnitPrice,
  isPrepaidEnough,
  validateServiceDelivery,
} from "@/lib/business-rules";
import { hasPermission, PERMISSIONS, ACTIONS } from "@/lib/permissions";
import { nextSequentialIdFromValidCodes, withUniqueRetry } from "@/lib/id-generation";
import { serviceTypeSchema } from "@/schemas/service-type.schema";
import { serviceReceiptSchema } from "@/schemas/service.schema";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function generateServiceReceiptId(tx: TransactionClient) {
  const records = await tx.phieuDichVu.findMany({
    where: { soPhieu: { startsWith: "PDV" } },
    select: { soPhieu: true },
  });
  return nextSequentialIdFromValidCodes(records.map((record) => record.soPhieu), "PDV", 7);
}
export async function getDanhSachLoaiDichVu() {
  const data = await prisma.loaiDichVu.findMany({
    orderBy: { maDV: "asc" },
  });
  return serialize(data);
}

export async function createLoaiDichVu(data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.LAP_DICH_VU, ACTIONS.CREATE, session))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }
    const validated = serviceTypeSchema.parse(data);

    const result = await prisma.loaiDichVu.create({
      data: {
        maDV: validated.maDV,
        tenDV: validated.tenDV,
        donGiaDV: validated.donGiaDV,
        nhomDV: validated.nhomDV,
      }
    });
    return { success: true, message: "Thêm loại dịch vụ thành công", data: serialize(result) };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: "Mã dịch vụ đã tồn tại" };
    }
    return { success: false, message: "Lỗi khi thêm loại dịch vụ" };
  }
}

export async function updateLoaiDichVu(maDV: string, data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.LAP_DICH_VU, ACTIONS.UPDATE, session))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }
    const validated = serviceTypeSchema.parse({ ...data, maDV });

    const result = await prisma.loaiDichVu.update({
      where: { maDV },
      data: {
        tenDV: validated.tenDV,
        donGiaDV: validated.donGiaDV,
        nhomDV: validated.nhomDV,
      }
    });
    return { success: true, message: "Cập nhật loại dịch vụ thành công", data: serialize(result) };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi cập nhật loại dịch vụ" };
  }
}

export async function deleteLoaiDichVu(maDV: string) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.LAP_DICH_VU, ACTIONS.DELETE, session))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Ràng buộc: Kiểm tra xem có chi tiết dịch vụ nào đang sử dụng loại này không
    const count = await prisma.chiTietDichVu.count({
      where: { maDV }
    });

    if (count > 0) {
      return { 
        success: false, 
        message: `Không thể xóa loại dịch vụ này vì đang được sử dụng trong ${count} phiếu dịch vụ.` 
      };
    }

    await prisma.loaiDichVu.delete({
      where: { maDV }
    });
    return { success: true, message: "Xóa loại dịch vụ thành công" };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi xóa loại dịch vụ" };
  }
}

export async function lapPhieuDichVu(data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.LAP_DICH_VU, ACTIONS.CREATE, session))) {
      return { success: false, message: "Bạn không có quyền lập phiếu dịch vụ" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap) : new Date();
    const validated = serviceReceiptSchema.parse({ ...data, ngayLap });

    const result = await withUniqueRetry(() => prisma.$transaction(async (tx) => {
      const soPhieu = await generateServiceReceiptId(tx);

      // 1. Lấy tham số hệ thống về tỉ lệ trả trước
      const thamSo = await tx.thamSo.findFirst({ where: { id: 1 } });
      const tiLeToiThieu = thamSo ? Number(thamSo.tiLeTraTruocToiThieu) : 50;

      // 2. Kiểm tra ràng buộc logic: TraTruoc >= (tiLeToiThieu% * ThanhTien) cho từng chi tiết
      const chiTietDaTinh = [];
      for (const ct of validated.chiTietDichVu) {
        const loaiDichVu = await tx.loaiDichVu.findUnique({ where: { maDV: ct.maDV } });
        if (!loaiDichVu) {
          throw new Error(`Loại dịch vụ ${ct.maDV} không tồn tại`);
        }

        const donGiaDV = Number(loaiDichVu.donGiaDV);
        // Đơn giá được tính = Đơn giá DV + Chi phí phát sinh (QĐ6)
        const donGiaDuocTinh = calculateServiceUnitPrice(donGiaDV, Number(ct.chiPhiPhatSinh || 0));
        // Thành tiền = Số lượng × Đơn giá được tính (QĐ6)
        const thanhTien = calculateLineTotal(Number(ct.soLuong), donGiaDuocTinh);
        if (!isPrepaidEnough(Number(ct.traTruoc), thanhTien, tiLeToiThieu)) {
          throw new Error(`Dịch vụ ${loaiDichVu.tenDV} yêu cầu trả trước tối thiểu ${tiLeToiThieu}%`);
        }
        const conLai = calculateRemainingAmount(thanhTien, Number(ct.traTruoc));

        chiTietDaTinh.push({
          maDV: ct.maDV,
          donGiaDV,
          chiPhiPhatSinh: Number(ct.chiPhiPhatSinh || 0),
          donGiaDuocTinh,
          soLuong: Number(ct.soLuong),
          thanhTien,
          traTruoc: Number(ct.traTruoc),
          conLai,
        });
      }

      const tongTien = chiTietDaTinh.reduce((sum, ct) => sum + ct.thanhTien, 0);
      const tongTraTruoc = chiTietDaTinh.reduce((sum, ct) => sum + ct.traTruoc, 0);
      const tongConLai = calculateRemainingAmount(tongTien, tongTraTruoc);

      // 3. Tạo phiếu dịch vụ
      const phieu = await tx.phieuDichVu.create({
        data: {
          soPhieu,
          ngayLap,
          maKH: validated.maKH || null,
          tenKhachHang: validated.tenKhachHang,
          soDienThoai: validated.soDienThoai,
          tongTien,
          tongTraTruoc,
          tongConLai,
          chiTietDichVu: {
            create: chiTietDaTinh.map((ct, index: number) => ({
              stt: index + 1,
              maDV: ct.maDV,
              donGiaDV: ct.donGiaDV,
              chiPhiPhatSinh: ct.chiPhiPhatSinh || 0,
              donGiaDuocTinh: ct.donGiaDuocTinh,
              soLuong: ct.soLuong,
              thanhTien: ct.thanhTien,
              traTruoc: ct.traTruoc,
              conLai: ct.conLai,
              ngayGiao: null, // Chưa giao
            }))
          }
        }
      });

      return phieu;
    }));

    return {
      success: true,
      message: "Lập phiếu dịch vụ thành công",
      data: serialize(result)
    };
  } catch (error: any) {
    console.error("[lapPhieuDichVu] Error:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi lập phiếu dịch vụ"
    };
  }
}

export async function getPhieuDichVuChiTiet(soPhieu: string) {
  const data = await prisma.phieuDichVu.findUnique({
    where: { soPhieu },
    include: {
      khachHang: true,
      chiTietDichVu: {
        include: { loaiDichVu: true },
        orderBy: { stt: 'asc' }
      }
    }
  });
  return serialize(data);
}

export async function updateTinhTrangDichVu(soPhieu: string, chiTietUpdates: any[]) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.TRA_CUU_DICH_VU, ACTIONS.UPDATE, session))) {
      return { success: false, message: "Bạn không có quyền cập nhật tình trạng dịch vụ" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentPhieu = await tx.phieuDichVu.findUnique({ where: { soPhieu } });
      if (!currentPhieu) {
        throw new Error("Phiếu dịch vụ không tồn tại");
      }

      // 1. Update each detail line
      for (const update of chiTietUpdates) {
        const stt = Number(update.stt);
        if (!Number.isInteger(stt) || stt <= 0) {
          throw new Error("Dòng chi tiết dịch vụ không hợp lệ");
        }

        const currentDetail = await tx.chiTietDichVu.findUnique({
          where: {
            soPhieu_stt: {
              soPhieu,
              stt,
            }
          },
          include: { loaiDichVu: true }
        });

        if (!currentDetail) {
          throw new Error(`Không tìm thấy dòng dịch vụ số ${stt}`);
        }
        
        const shouldRollbackDelivery =
          update.ngayGiao === null ||
          update.daGiao === false ||
          update.tinhTrang === "ChuaGiao";
        let validNgayGiao: Date | null = shouldRollbackDelivery ? null : new Date();
        if (!shouldRollbackDelivery && update.ngayGiao && !isNaN(new Date(update.ngayGiao).getTime())) {
          validNgayGiao = new Date(update.ngayGiao);
        }

        if (!shouldRollbackDelivery && currentDetail.loaiDichVu.nhomDV === "KiemDinh") {
          const ketQua = String(update.ketQua || "").trim();
          if (ketQua !== "Đạt chuẩn" && ketQua !== "Không đạt chuẩn") {
            throw new Error(`Dòng kiểm định số ${stt} phải có kết quả "Đạt chuẩn" hoặc "Không đạt chuẩn"`);
          }
          validateServiceDelivery(currentDetail.loaiDichVu.nhomDV, ketQua);
        }
        
        await tx.chiTietDichVu.update({
          where: {
            soPhieu_stt: {
              soPhieu,
              stt
            }
          },
          data: {
            ketQua: shouldRollbackDelivery ? null : update.ketQua || null,
            soChungThu: shouldRollbackDelivery ? null : update.soChungThu || null,
            ngayGiao: validNgayGiao,
          }
        });
      }

      // 2. Update overall receipt status
      const remainingUndelivered = await tx.chiTietDichVu.count({
        where: {
          soPhieu,
          ngayGiao: null,
        }
      });

      const updatedPhieu = await tx.phieuDichVu.update({
        where: { soPhieu },
        data: {
          tinhTrang: remainingUndelivered === 0 ? 'HoanThanh' : 'ChuaHoanThanh'
        },
        include: {
          chiTietDichVu: {
            include: { loaiDichVu: true }
          }
        }
      });

      const newStatus = remainingUndelivered === 0 ? "HoanThanh" : "ChuaHoanThanh";
      const revenueAmount = Number(currentPhieu.tongTien);
      const hasJustCompleted = currentPhieu.tinhTrang !== "HoanThanh" && newStatus === "HoanThanh";
      const hasJustRolledBack = currentPhieu.tinhTrang === "HoanThanh" && newStatus !== "HoanThanh";

      if (hasJustCompleted) {
        const completedDate = new Date(currentPhieu.ngayLap);
        const reportDate = {
          ngay: completedDate.getDate(),
          thang: completedDate.getMonth() + 1,
          nam: completedDate.getFullYear(),
        };

        await tx.baoCaoDoanhThu.upsert({
          where: { ngay_thang_nam: reportDate },
          create: {
            ...reportDate,
            dtBanHang: 0,
            dtDichVu: revenueAmount,
            tongDT: revenueAmount,
          },
          update: {
            dtDichVu: { increment: revenueAmount },
            tongDT: { increment: revenueAmount },
          },
        });
      } else if (hasJustRolledBack) {
        const completedDate = new Date(currentPhieu.ngayLap);
        await tx.baoCaoDoanhThu.updateMany({
          where: {
            ngay: completedDate.getDate(),
            thang: completedDate.getMonth() + 1,
            nam: completedDate.getFullYear(),
          },
          data: {
            dtDichVu: { decrement: revenueAmount },
            tongDT: { decrement: revenueAmount },
          },
        });
      }

      return updatedPhieu;
    });

    return {
      success: true,
      message: "Cập nhật trạng thái phiếu thành công",
      data: serialize(result)
    };
  } catch (error: any) {
    console.error("[updateTinhTrangDichVu] Error details:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi cập nhật trạng thái phiếu"
    };
  }
}
