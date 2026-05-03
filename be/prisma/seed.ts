import { PrismaClient, HamLuong, NhomDichVu, TinhTrangDichVu } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  /*
   * =========================
   * DON VI TINH
   * =========================
   */
  await prisma.donViTinh.createMany({
    data: [
      {
        maDVT: 'DVT001',
        tenDVT: 'Lượng'
      },
      {
        maDVT: 'DVT002',
        tenDVT: 'Chỉ'
      },
      {
        maDVT: 'DVT003',
        tenDVT: 'Gram'
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * LOAI SAN PHAM
   * =========================
   */
  await prisma.loaiSanPham.createMany({
    data: [
      {
        maLSP: 'LSP001',
        tenLSP: 'Vàng miếng',
        maDVT: 'DVT001',
        phanTramLoiNhuan: 10
      },
      {
        maLSP: 'LSP002',
        tenLSP: 'Nữ trang',
        maDVT: 'DVT002',
        phanTramLoiNhuan: 15
      },
      {
        maLSP: 'LSP003',
        tenLSP: 'Đá quý',
        maDVT: 'DVT003',
        phanTramLoiNhuan: 20
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * SAN PHAM
   * =========================
   */
  await prisma.sanPham.createMany({
    data: [
      {
        maSP: 'SP001',
        tenSP: 'Nhẫn vàng 24K',
        maLSP: 'LSP002',
        hamLuong: HamLuong.K24,
        trongLuong: 1.5,
        maDVT: 'DVT002',
        tonToiThieu: 5,
        tonKho: 20,
        donGiaNhap: 5000000,
        donGiaBan: 5500000
      },
      {
        maSP: 'SP002',
        tenSP: 'Dây chuyền vàng 18K',
        maLSP: 'LSP002',
        hamLuong: HamLuong.K18,
        trongLuong: 3,
        maDVT: 'DVT002',
        tonToiThieu: 3,
        tonKho: 10,
        donGiaNhap: 12000000,
        donGiaBan: 13800000
      },
      {
        maSP: 'SP003',
        tenSP: 'Vàng miếng SJC',
        maLSP: 'LSP001',
        hamLuong: HamLuong.K24,
        trongLuong: 10,
        maDVT: 'DVT001',
        tonToiThieu: 2,
        tonKho: 5,
        donGiaNhap: 85000000,
        donGiaBan: 90000000
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * NHA CUNG CAP
   * =========================
   */
  await prisma.nhaCungCap.createMany({
    data: [
      {
        maNCC: 'NCC001',
        tenNCC: 'Công ty vàng bạc PNJ',
        diaChi: 'TP.HCM',
        soDienThoai: '0901234567',
        nguoiLienHe: 'Nguyễn Văn A'
      },
      {
        maNCC: 'NCC002',
        tenNCC: 'SJC',
        diaChi: 'Hà Nội',
        soDienThoai: '0912345678',
        nguoiLienHe: 'Trần Văn B'
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * LOAI DICH VU
   * =========================
   */
  await prisma.loaiDichVu.createMany({
    data: [
      {
        maDV: 'DV001',
        tenDV: 'Gia công trang sức',
        donGiaDV: 500000,
        nhomDV: NhomDichVu.GiaCong
      },
      {
        maDV: 'DV002',
        tenDV: 'Kiểm định vàng',
        donGiaDV: 300000,
        nhomDV: NhomDichVu.KiemDinh
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * NHOM NGUOI DUNG
   * =========================
   */
  await prisma.nhomNguoiDung.createMany({
    data: [
      {
        maNhom: 'NH001',
        tenNhom: 'Quản lý'
      },
      {
        maNhom: 'NH002',
        tenNhom: 'Nhân viên'
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * CHUC NANG
   * =========================
   */
  await prisma.chucNang.createMany({
    data: [
      {
        maChucNang: 'CN001',
        tenChucNang: 'Dashboard',
        tenManHinhDuocLoad: '/dashboard'
      },
      {
        maChucNang: 'CN002',
        tenChucNang: 'Quản lý sản phẩm',
        tenManHinhDuocLoad: '/dashboard/san-pham'
      },
      {
        maChucNang: 'CN003',
        tenChucNang: 'Báo cáo doanh thu',
        tenManHinhDuocLoad: '/dashboard/bao-cao-doanh-thu'
      },
      {
        maChucNang: 'CN004',
        tenChucNang: 'Thay đổi quy định',
        tenManHinhDuocLoad: '/dashboard/tham-so'
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * BANG PHAN QUYEN
   * =========================
   */
  await prisma.bangPhanQuyen.createMany({
    data: [
      {
        maNhom: 'NH001',
        maChucNang: 'CN001'
      },
      {
        maNhom: 'NH001',
        maChucNang: 'CN002'
      },
      {
        maNhom: 'NH001',
        maChucNang: 'CN003'
      },
      {
        maNhom: 'NH001',
        maChucNang: 'CN004'
      },
      {
        maNhom: 'NH002',
        maChucNang: 'CN001'
      },
      {
        maNhom: 'NH002',
        maChucNang: 'CN002'
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * NGUOI DUNG
   * =========================
   */
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  const staffPassword = await bcrypt.hash('NhanVien@123', 10)

  await prisma.nguoiDung.createMany({
    data: [
      {
        maND: 'ND001',
        tenDangNhap: 'admin',
        matKhau: adminPassword,
        hoTen: 'Quản trị viên',
        maNhom: 'NH001'
      },
      {
        maND: 'ND002',
        tenDangNhap: 'nhanvien',
        matKhau: staffPassword,
        hoTen: 'Nhân viên 1',
        maNhom: 'NH002'
      }
    ],
    skipDuplicates: true
  })

  /*
   * =========================
   * THAM SO
   * =========================
   */
  await prisma.thamSo.upsert({
    where: {
      id: 1
    },
    update: {},
    create: {
      id: 1,
      phanTramLoiNhuanToiThieu: 5,
      soLuongTonKhoToiThieu: 2,
      tiLeTraTruocToiThieu: 50
    }
  })

  /*
   * =========================
   * PHIEU BAN HANG
   * =========================
   */
  await prisma.phieuBanHang.create({
    data: {
      soPhieu: 'PBH000001',
      ngayLap: new Date(),
      tenKhachHang: 'Lê Thị C',
      tongTien: 11000000,
      chiTietBanHang: {
        create: [
          {
            maSP: 'SP001',
            soLuong: 2,
            donGia: 5500000,
            thanhTien: 11000000
          }
        ]
      }
    }
  })

  /*
   * =========================
   * PHIEU MUA HANG
   * =========================
   */
  await prisma.phieuMuaHang.create({
    data: {
      soPhieu: 'PMH000001',
      ngayLap: new Date(),
      maNCC: 'NCC001',
      tongTien: 25000000,
      chiTietMuaHang: {
        create: [
          {
            maSP: 'SP002',
            soLuong: 2,
            donGia: 12500000,
            thanhTien: 25000000
          }
        ]
      }
    }
  })

  /*
   * =========================
   * PHIEU DICH VU
   * =========================
   */
  await prisma.phieuDichVu.create({
    data: {
      soPhieu: 'PDV000001',
      ngayLap: new Date(),
      tenKhachHang: 'Nguyễn Văn D',
      soDienThoai: '0988888888',
      tongTien: 700000,
      tongTraTruoc: 400000,
      tongConLai: 300000,
      tinhTrang: TinhTrangDichVu.ChuaHoanThanh,
      chiTietDichVu: {
        create: [
          {
            stt: 1,
            maDV: 'DV001',
            donGiaDV: 500000,
            chiPhiPhatSinh: 200000,
            donGiaDuocTinh: 700000,
            soLuong: 1,
            thanhTien: 700000,
            traTruoc: 400000,
            conLai: 300000,
            ngayGiao: new Date()
          }
        ]
      }
    }
  })

  console.log('✅ Seeding finished successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })