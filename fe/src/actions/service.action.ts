'use server';

import { prisma } from '@/lib/prisma';

function serialize(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getDanhSachLoaiDichVu() {
  const data = await prisma.loaiDichVu.findMany({
    orderBy: { maDV: 'asc' }
  });
  return serialize(data);
}

export async function lapPhieuDichVu(data: any) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lấy tham số hệ thống về tỉ lệ trả trước
    const thamSo = await tx.thamSo.findFirst({ where: { id: 1 } });
    const tiLeToiThieu = thamSo ? Number(thamSo.tiLeTraTruocToiThieu) : 50;

    // 2. Kiểm tra ràng buộc logic: TraTruoc >= (tiLeToiThieu% * ThanhTien)
    const phanTramThucTe = (data.tongTraTruoc / data.tongTien) * 100;
    if (phanTramThucTe < tiLeToiThieu) {
      throw new Error(`Tiền trả trước phải tối thiểu ${tiLeToiThieu}% tổng giá trị (${tiLeToiThieu/100 * data.tongTien} VNĐ)`);
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
            ngayGiao: ct.ngayGiao ? new Date(ct.ngayGiao) : null
          }))
        }
      }
    });

    return serialize(phieu);
  });
}

export async function getDanhSachPhieuDichVu() {
  const data = await prisma.phieuDichVu.findMany({
    include: { chiTietDichVu: { include: { loaiDichVu: true } } },
    orderBy: { ngayLap: 'desc' }
  });
  return serialize(data);
}
