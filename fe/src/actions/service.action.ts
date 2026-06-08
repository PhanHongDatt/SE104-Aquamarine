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
import { nextSequentialId, nextSequentialIdFromValidCodes, withUniqueRetry } from "@/lib/id-generation";
import { syncBaoCaoDoanhThuForDate } from "@/lib/revenue-report-sync";
import { formatBusinessDate, getBusinessDateKey } from "@/lib/business-date";
import { serviceTypeSchema } from "@/schemas/service-type.schema";
import { serviceReceiptSchema } from "@/schemas/service.schema";
import { revalidatePath } from "next/cache";

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
  const session = await getServerSession(authOptions) as any;
  const canViewTypes = await hasPermission(PERMISSIONS.LOAI_DICH_VU, ACTIONS.VIEW, session);
  const canCreateReceipt = await hasPermission(PERMISSIONS.LAP_DICH_VU, ACTIONS.CREATE, session);
  if (!canViewTypes && !canCreateReceipt) {
    throw new Error("Bạn không có quyền xem loại dịch vụ");
  }
  const data = await prisma.loaiDichVu.findMany({
    orderBy: { maDV: "asc" },
  });
  return serialize(data);
}

export async function createLoaiDichVu(data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.LOAI_DICH_VU, ACTIONS.CREATE, session))) {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }
    const validated = serviceTypeSchema.parse(data);

    const result = await withUniqueRetry(async () => {
      const lastItem = await prisma.loaiDichVu.findFirst({
        orderBy: { maDV: 'desc' },
      });
      const maDV = nextSequentialId(lastItem?.maDV, "DV", 4);

      return prisma.loaiDichVu.create({
        data: {
          maDV,
          tenDV: validated.tenDV,
          donGiaDV: validated.donGiaDV,
          nhomDV: validated.nhomDV,
        }
      });
    });
    return { success: true, message: "Thêm loại dịch vụ thành công", data: serialize(result) };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: "Tên dịch vụ đã tồn tại" };
    }
    return { success: false, message: "Lỗi khi thêm loại dịch vụ" };
  }
}

export async function updateLoaiDichVu(maDV: string, data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.LOAI_DICH_VU, ACTIONS.UPDATE, session))) {
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
    if (!(await hasPermission(PERMISSIONS.LOAI_DICH_VU, ACTIONS.DELETE, session))) {
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
      const duplicatedService = validated.chiTietDichVu.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maDV === item.maDV) !== index
      );
      if (duplicatedService) {
        throw new Error(`Dịch vụ ${duplicatedService.maDV} bị nhập trùng trong phiếu dịch vụ`);
      }

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

export async function updatePhieuDichVu(soPhieu: string, data: any) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.TRA_CUU_DICH_VU, ACTIONS.UPDATE, session))) {
      return { success: false, message: "Bạn không có quyền sửa phiếu dịch vụ" };
    }

    const ngayLap = data.ngayLap ? new Date(data.ngayLap) : new Date();
    const validated = serviceReceiptSchema.parse({ ...data, soPhieu, ngayLap });

    const result = await prisma.$transaction(async (tx) => {
      const currentPhieu = await tx.phieuDichVu.findUnique({
        where: { soPhieu },
        include: { chiTietDichVu: true },
      });
      if (!currentPhieu) {
        throw new Error("Phiếu dịch vụ không tồn tại");
      }
      if (currentPhieu.chiTietDichVu.some((ct) => ct.ngayGiao)) {
        throw new Error("Không thể sửa nội dung phiếu dịch vụ đã có dòng đã giao. Hãy cập nhật trạng thái giao hoặc xóa phiếu theo đúng ràng buộc.");
      }

      const duplicatedService = validated.chiTietDichVu.find((item, index, items) =>
        items.findIndex((candidate) => candidate.maDV === item.maDV) !== index
      );
      if (duplicatedService) {
        throw new Error(`Dịch vụ ${duplicatedService.maDV} bị nhập trùng trong phiếu dịch vụ`);
      }

      const thamSo = await tx.thamSo.findFirst({ where: { id: 1 } });
      const tiLeToiThieu = thamSo ? Number(thamSo.tiLeTraTruocToiThieu) : 50;

      const chiTietDaTinh = [];
      for (const ct of validated.chiTietDichVu) {
        const loaiDichVu = await tx.loaiDichVu.findUnique({ where: { maDV: ct.maDV } });
        if (!loaiDichVu) {
          throw new Error(`Loại dịch vụ ${ct.maDV} không tồn tại`);
        }

        const donGiaDV = Number(loaiDichVu.donGiaDV);
        const donGiaDuocTinh = calculateServiceUnitPrice(donGiaDV, Number(ct.chiPhiPhatSinh || 0));
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

      await tx.chiTietDichVu.deleteMany({ where: { soPhieu } });
      const updated = await tx.phieuDichVu.update({
        where: { soPhieu },
        data: {
          ngayLap,
          maKH: validated.maKH || null,
          tenKhachHang: validated.tenKhachHang,
          soDienThoai: validated.soDienThoai,
          tongTien,
          tongTraTruoc,
          tongConLai,
          tinhTrang: "ChuaHoanThanh",
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
              ngayGiao: null,
            })),
          },
        },
        include: {
          chiTietDichVu: {
            include: { loaiDichVu: true },
            orderBy: { stt: "asc" },
          },
        },
      });

      await syncBaoCaoDoanhThuForDate(tx, new Date(currentPhieu.ngayLap));
      if (getBusinessDateKey(currentPhieu.ngayLap) !== getBusinessDateKey(ngayLap)) {
        await syncBaoCaoDoanhThuForDate(tx, ngayLap);
      }

      return updated;
    });

    revalidatePath("/admin/dich-vu/phieu-dich-vu");
    revalidatePath("/nhan-vien/dich-vu/tra-cuu");
    revalidatePath(`/admin/dich-vu/phieu-dich-vu/${soPhieu}`);
    revalidatePath(`/nhan-vien/dich-vu/tra-cuu/${soPhieu}`);
    revalidatePath("/admin/bao-cao/doanh-thu");
    revalidatePath("/nhan-vien/bao-cao/doanh-thu");
    return { success: true, message: "Cập nhật phiếu dịch vụ thành công", data: serialize(result) };
  } catch (error: any) {
    console.error("[updatePhieuDichVu] Error:", error);
    return { success: false, message: error.message || "Lỗi khi sửa phiếu dịch vụ" };
  }
}

export async function getPhieuDichVuChiTiet(soPhieu: string) {
  const session = await getServerSession(authOptions) as any;
  if (!(await hasPermission(PERMISSIONS.TRA_CUU_DICH_VU, ACTIONS.VIEW, session))) {
    throw new Error("Bạn không có quyền xem phiếu dịch vụ");
  }
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

export async function getDanhSachPhieuDichVu() {
  const session = await getServerSession(authOptions) as any;
  if (!(await hasPermission(PERMISSIONS.TRA_CUU_DICH_VU, ACTIONS.VIEW, session))) {
    throw new Error("Bạn không có quyền xem phiếu dịch vụ");
  }
  const data = await prisma.phieuDichVu.findMany({
    include: { chiTietDichVu: true },
    orderBy: { ngayLap: "desc" },
  });
  return serialize(data.map((phieu) => ({
    ...phieu,
    tinhTrang: phieu.chiTietDichVu.length > 0 && phieu.chiTietDichVu.every((ct) => ct.ngayGiao)
      ? "HoanThanh"
      : "ChuaHoanThanh",
  })));
}

export async function deletePhieuDichVu(soPhieu: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!(await hasPermission(PERMISSIONS.TRA_CUU_DICH_VU, ACTIONS.DELETE, session))) {
      return { success: false, message: "Bạn không có quyền xóa phiếu dịch vụ" };
    }

    await prisma.$transaction(async (tx) => {
      const phieu = await tx.phieuDichVu.findUnique({
        where: { soPhieu },
        include: { chiTietDichVu: true },
      });
      if (!phieu) {
        throw new Error("Phiếu dịch vụ không tồn tại");
      }

      const reportDate = new Date(phieu.ngayLap);
      await tx.chiTietDichVu.deleteMany({ where: { soPhieu } });
      await tx.phieuDichVu.delete({ where: { soPhieu } });
      await syncBaoCaoDoanhThuForDate(tx, reportDate);
    });

    revalidatePath("/admin/dich-vu/phieu-dich-vu");
    revalidatePath("/nhan-vien/dich-vu/tra-cuu");
    revalidatePath("/admin/bao-cao/doanh-thu");
    revalidatePath("/nhan-vien/bao-cao/doanh-thu");
    return { success: true, message: "Xóa phiếu dịch vụ thành công và đã cập nhật doanh thu liên quan" };
  } catch (error: any) {
    console.error("[deletePhieuDichVu] Error:", error);
    return { success: false, message: error.message || "Lỗi khi xóa phiếu dịch vụ" };
  }
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
      const receiptDateKey = getBusinessDateKey(currentPhieu.ngayLap);

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
        if (!shouldRollbackDelivery && validNgayGiao) {
          const deliveryDateKey = getBusinessDateKey(validNgayGiao);
          if (deliveryDateKey < receiptDateKey) {
            throw new Error(`Ngày giao thực tế của dòng ${stt} không được trước ngày lập phiếu (${formatBusinessDate(currentPhieu.ngayLap)})`);
          }
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

      await syncBaoCaoDoanhThuForDate(tx, new Date(currentPhieu.ngayLap));

      return updatedPhieu;
    });

    revalidatePath("/admin/bao-cao/doanh-thu");
    revalidatePath("/nhan-vien/bao-cao/doanh-thu");
    revalidatePath("/admin/dich-vu/phieu-dich-vu");
    revalidatePath("/nhan-vien/dich-vu/tra-cuu");
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
