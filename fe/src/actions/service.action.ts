'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getDanhSachLoaiDichVu() {
  const data = await prisma.loaiDichVu.findMany({
    orderBy: { maDV: "asc" },
  });
  return serialize(data);
}

export async function createLoaiDichVu(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const result = await prisma.loaiDichVu.create({
      data: {
        maDV: data.maDV,
        tenDV: data.tenDV,
        donGiaDV: data.donGiaDV,
        nhomDV: data.nhomDV,
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
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
      return { success: false, message: "Bạn không có quyền thực hiện thao tác này" };
    }

    const result = await prisma.loaiDichVu.update({
      where: { maDV },
      data: {
        tenDV: data.tenDV,
        donGiaDV: data.donGiaDV,
        nhomDV: data.nhomDV,
      }
    });
    return { success: true, message: "Cập nhật loại dịch vụ thành công", data: serialize(result) };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi cập nhật loại dịch vụ" };
  }
}

export async function deleteLoaiDichVu(maDV: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "QUAN_LY") {
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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lấy tham số hệ thống về tỉ lệ trả trước
      const thamSo = await tx.thamSo.findFirst({ where: { id: 1 } });
      const tiLeToiThieu = thamSo ? Number(thamSo.tiLeTraTruocToiThieu) : 50;

      // 2. Kiểm tra ràng buộc logic: TraTruoc >= (tiLeToiThieu% * ThanhTien) cho từng chi tiết
      for (const ct of data.chiTietDichVu) {
        const phanTramCT = (ct.traTruoc / ct.thanhTien) * 100;
        if (phanTramCT < tiLeToiThieu) {
          throw new Error(`Dịch vụ ${ct.tenDV} yêu cầu trả trước tối thiểu ${tiLeToiThieu}%`);
        }
      }

      // 3. Tạo phiếu dịch vụ
      const phieu = await tx.phieuDichVu.create({
        data: {
          soPhieu: data.soPhieu,
          tenKhachHang: data.tenKhachHang,
          soDienThoai: data.soDienThoai,
          tongTien: data.tongTien,
          tongTraTruoc: data.tongTraTruoc,
          tongConLai: data.tongTien - data.tongTraTruoc,
          chiTietDichVu: {
            create: data.chiTietDichVu.map((ct: any, index: number) => ({
              stt: index + 1,
              maDV: ct.maDV,
              donGiaDV: ct.donGiaDV,
              chiPhiPhatSinh: ct.chiPhiPhatSinh || 0,
              donGiaDuocTinh: ct.donGiaDV + (ct.chiPhiPhatSinh || 0),
              soLuong: ct.soLuong,
              thanhTien: ct.thanhTien,
              traTruoc: ct.traTruoc,
              conLai: ct.thanhTien - ct.traTruoc,
              ngayGiao: null, // Chưa giao
            }))
          }
        }
      });

      // 4. Cập nhật báo cáo doanh thu
      const today = new Date();
      const ngay = today.getDate();
      const thang = today.getMonth() + 1;
      const nam = today.getFullYear();

      await tx.baoCaoDoanhThu.upsert({
        where: {
          ngay_thang_nam: {
            ngay: ngay,
            thang: thang,
            nam: nam
          }
        },
        create: {
          ngay, thang, nam,
          dtBanHang: 0,
          dtDichVu: data.tongTien,
          tongDT: data.tongTien
        },
        update: {
          dtDichVu: { increment: data.tongTien },
          tongDT: { increment: data.tongTien }
        }
      });

      return phieu;
    });

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
    console.log(`[updateTinhTrangDichVu] Updating receipt: ${soPhieu}`);
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update each detail line
      for (const update of chiTietUpdates) {
        const stt = Number(update.stt);
        
        let validNgayGiao = new Date();
        if (update.ngayGiao && !isNaN(new Date(update.ngayGiao).getTime())) {
          validNgayGiao = new Date(update.ngayGiao);
        }

        console.log(`[updateTinhTrangDichVu] Updating detail stt: ${stt}, result: ${update.ketQua}`);
        
        await tx.chiTietDichVu.update({
          where: {
            soPhieu_stt: {
              soPhieu: soPhieu,
              stt: stt
            }
          },
          data: {
            ketQua: update.ketQua || null,
            soChungThu: update.soChungThu || null,
            ngayGiao: validNgayGiao,
          }
        });
      }

      // 2. Update overall receipt status
      const updatedPhieu = await tx.phieuDichVu.update({
        where: { soPhieu },
        data: {
          tinhTrang: 'HoanThanh'
        },
        include: {
          chiTietDichVu: {
            include: { loaiDichVu: true }
          }
        }
      });

      return updatedPhieu;
    });

    console.log(`[updateTinhTrangDichVu] Successfully updated receipt: ${soPhieu}`);
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
