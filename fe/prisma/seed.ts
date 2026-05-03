import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // ── 1. Đơn Vị Tính ──────────────────────────────────────────
  await Promise.all([
    prisma.donViTinh.upsert({ where: { maDVT: 'DVT001' }, update: {}, create: { maDVT: 'DVT001', tenDVT: 'Chỉ' } }),
    prisma.donViTinh.upsert({ where: { maDVT: 'DVT002' }, update: {}, create: { maDVT: 'DVT002', tenDVT: 'Gram' } }),
    prisma.donViTinh.upsert({ where: { maDVT: 'DVT003' }, update: {}, create: { maDVT: 'DVT003', tenDVT: 'Cái' } }),
    prisma.donViTinh.upsert({ where: { maDVT: 'DVT004' }, update: {}, create: { maDVT: 'DVT004', tenDVT: 'Viên' } }),
  ])

  // ── 2. Loại Sản Phẩm ────────────────────────────────────────
  await Promise.all([
    prisma.loaiSanPham.upsert({ where: { maLSP: 'LSP001' }, update: {}, create: { maLSP: 'LSP001', tenLSP: 'Vàng 9999', maDVT: 'DVT001', phanTramLoiNhuan: 10.5 } }),
    prisma.loaiSanPham.upsert({ where: { maLSP: 'LSP002' }, update: {}, create: { maLSP: 'LSP002', tenLSP: 'Vàng 18K', maDVT: 'DVT001', phanTramLoiNhuan: 12.0 } }),
    prisma.loaiSanPham.upsert({ where: { maLSP: 'LSP003' }, update: {}, create: { maLSP: 'LSP003', tenLSP: 'Bạc 925', maDVT: 'DVT002', phanTramLoiNhuan: 8.0 } }),
    prisma.loaiSanPham.upsert({ where: { maLSP: 'LSP004' }, update: {}, create: { maLSP: 'LSP004', tenLSP: 'Kim Cương', maDVT: 'DVT004', phanTramLoiNhuan: 25.0 } }),
    prisma.loaiSanPham.upsert({ where: { maLSP: 'LSP005' }, update: {}, create: { maLSP: 'LSP005', tenLSP: 'Đá Quý Tổng Hợp', maDVT: 'DVT004', phanTramLoiNhuan: 30.0 } }),
  ])

  // ── 3. Sản Phẩm ─────────────────────────────────────────────
  const products = [
    { maSP: 'SP001', tenSP: 'Nhẫn Vàng 9999 Trơn', maLSP: 'LSP001', hamLuong: 'K24', trongLuong: 2.5, maDVT: 'DVT001', tonToiThieu: 5, tonKho: 50, donGiaNhap: 18500000, donGiaBan: 20450000 },
    { maSP: 'SP002', tenSP: 'Lắc Tay Vàng 18K Đính Đá', maLSP: 'LSP002', hamLuong: 'K18', trongLuong: 5.0, maDVT: 'DVT001', tonToiThieu: 3, tonKho: 30, donGiaNhap: 32000000, donGiaBan: 36000000 },
    { maSP: 'SP003', tenSP: 'Dây Chuyền Bạc 925', maLSP: 'LSP003', hamLuong: 'K18', trongLuong: 8.0, maDVT: 'DVT002', tonToiThieu: 10, tonKho: 100, donGiaNhap: 450000, donGiaBan: 490000 },
    { maSP: 'SP004', tenSP: 'Nhẫn Kim Cương Solitaire 0.5ct', maLSP: 'LSP004', hamLuong: 'K18', trongLuong: 3.2, maDVT: 'DVT003', tonToiThieu: 2, tonKho: 15, donGiaNhap: 85000000, donGiaBan: 106000000 },
    { maSP: 'SP005', tenSP: 'Bông Tai Vàng 9999', maLSP: 'LSP001', hamLuong: 'K24', trongLuong: 1.8, maDVT: 'DVT003', tonToiThieu: 5, tonKho: 40, donGiaNhap: 13500000, donGiaBan: 14900000 },
    { maSP: 'SP009', tenSP: 'Nhẫn Cưới Kim Cương Đôi', maLSP: 'LSP004', hamLuong: 'K18', trongLuong: 6.5, maDVT: 'DVT003', tonToiThieu: 2, tonKho: 10, donGiaNhap: 150000000, donGiaBan: 187500000 },
    { maSP: 'SP010', tenSP: 'Dây Chuyền Vàng 24K 5 Chỉ', maLSP: 'LSP001', hamLuong: 'K24', trongLuong: 18.75, maDVT: 'DVT001', tonToiThieu: 2, tonKho: 5, donGiaNhap: 42000000, donGiaBan: 46200000 },
    { maSP: 'SP011', tenSP: 'Vòng Cổ Ngọc Trai Biển', maLSP: 'LSP005', hamLuong: 'K14', trongLuong: 15.0, maDVT: 'DVT003', tonToiThieu: 3, tonKho: 20, donGiaNhap: 25000000, donGiaBan: 32500000 },
  ]

  for (const p of products) {
    await prisma.sanPham.upsert({ where: { maSP: p.maSP }, update: {}, create: p as any })
  }

  // ── 4. Nhà Cung Cấp ─────────────────────────────────────────
  await Promise.all([
    prisma.nhaCungCap.upsert({ where: { maNCC: 'NCC001' }, update: {}, create: { maNCC: 'NCC001', tenNCC: 'Công ty Vàng SJC', diaChi: '79 Hàm Nghi, Q1, TP.HCM', soDienThoai: '0283822100', nguoiLienHe: 'Nguyễn Văn A' } }),
    prisma.nhaCungCap.upsert({ where: { maNCC: 'NCC002' }, update: {}, create: { maNCC: 'NCC002', tenNCC: 'Trang Sức DOJI', diaChi: '5 Lê Duẩn, Q1, TP.HCM', soDienThoai: '0283844555', nguoiLienHe: 'Trần Thị B' } }),
    prisma.nhaCungCap.upsert({ where: { maNCC: 'NCC003' }, update: {}, create: { maNCC: 'NCC003', tenNCC: 'Kim Hoàn PNJ', diaChi: '170E Phan Đăng Lưu, Phú Nhuận, TP.HCM', soDienThoai: '0283995671', nguoiLienHe: 'Lê Văn C' } }),
    prisma.nhaCungCap.upsert({ where: { maNCC: 'NCC005' }, update: {}, create: { maNCC: 'NCC005', tenNCC: 'Thế Giới Kim Cương', diaChi: 'Vincom Center, Q1, TP.HCM', soDienThoai: '0286677889', nguoiLienHe: 'Lý Tiểu Long' } }),
  ])

  // ── 5. Loại Dịch Vụ ─────────────────────────────────────────
  const serviceTypes = [
    { maDV: 'DV0001', tenDV: 'Gia công nhẫn trơn', donGiaDV: 200000, nhomDV: 'GiaCong' },
    { maDV: 'DV0002', tenDV: 'Gia công lắc tay', donGiaDV: 350000, nhomDV: 'GiaCong' },
    { maDV: 'DV0003', tenDV: 'Kiểm định vàng', donGiaDV: 150000, nhomDV: 'KiemDinh' },
    { maDV: 'DV0004', tenDV: 'Kiểm định đá quý', donGiaDV: 300000, nhomDV: 'KiemDinh' },
    { maDV: 'DV0005', tenDV: 'Đánh bóng trang sức', donGiaDV: 100000, nhomDV: 'GiaCong' },
    { maDV: 'DV0006', tenDV: 'Xi mạ bạch kim', donGiaDV: 500000, nhomDV: 'GiaCong' },
  ]
  for (const st of serviceTypes) {
    await prisma.loaiDichVu.upsert({ where: { maDV: st.maDV }, update: {}, create: st as any })
  }

  // ── 6. Nhóm & Người Dùng ────────────────────────────────────
  await prisma.nhomNguoiDung.upsert({ where: { maNhom: 'QUANLY' }, update: {}, create: { maNhom: 'QUANLY', tenNhom: 'QUAN_LY' } })
  await prisma.nhomNguoiDung.upsert({ where: { maNhom: 'NHANVI' }, update: {}, create: { maNhom: 'NHANVI', tenNhom: 'NHAN_VIEN' } })
  await prisma.nguoiDung.upsert({ where: { tenDangNhap: 'admin' }, update: {}, create: { maND: 'ND0001', tenDangNhap: 'admin', matKhau: 'Admin@123', hoTen: 'Nguyễn Quản Lý', maNhom: 'QUANLY' } })
  await prisma.nguoiDung.upsert({ where: { tenDangNhap: 'nhanvien' }, update: {}, create: { maND: 'ND0002', tenDangNhap: 'nhanvien', matKhau: 'Nhanvien@1', hoTen: 'Trần Nhân Viên', maNhom: 'NHANVI' } })

  // ── 7. Tham Số ──────────────────────────────────────────────
  await prisma.thamSo.upsert({ where: { id: 1 }, update: {}, create: { id: 1, phanTramLoiNhuanToiThieu: 5.0, soLuongTonKhoToiThieu: 1, tiLeTraTruocToiThieu: 50.0 } })

  // ── Helper for Names ──────────────────────────────────────
  const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const lot = ['Văn', 'Thị', 'Minh', 'Hữu', 'Tuấn', 'Thanh', 'Bảo', 'Gia', 'Đức', 'Anh']
  const ten = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Phong', 'Giang', 'Hương', 'Inh', 'Khánh', 'Linh', 'Nam', 'Oanh', 'Phúc', 'Quang', 'Sơn', 'Thảo', 'Uyên', 'Việt', 'Yến']

  const getRandomName = () => `${ho[Math.floor(Math.random() * ho.length)]} ${lot[Math.floor(Math.random() * lot.length)]} ${ten[Math.floor(Math.random() * ten.length)]}`

  // ── 8. Phiếu Bán Hàng & Chi Tiết (30 bản ghi) ────────────────
  console.log('Seeding 30 sales orders...')
  for (let i = 1; i <= 30; i++) {
    const soPhieu = `PBH${i.toString().padStart(7, '0')}`
    const randomItemsCount = Math.floor(Math.random() * 3) + 1
    const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, randomItemsCount)
    
    let tongTien = 0
    const items = selectedProducts.map(p => {
      const soLuong = Math.floor(Math.random() * 2) + 1
      const thanhTien = Number(p.donGiaBan) * soLuong
      tongTien += thanhTien
      return { maSP: p.maSP, soLuong, donGia: p.donGiaBan, thanhTien }
    })

    await prisma.phieuBanHang.upsert({
      where: { soPhieu },
      update: {},
      create: {
        soPhieu,
        tenKhachHang: getRandomName(),
        tongTien,
        ngayLap: new Date(2026, 3, Math.floor(Math.random() * 30) + 1), // April 2026
        chiTietBanHang: {
          create: items.map(item => ({
            maSP: item.maSP,
            soLuong: item.soLuong,
            donGia: item.donGia,
            thanhTien: item.thanhTien
          }))
        }
      }
    })
  }

  // ── 9. Phiếu Mua Hàng & Chi Tiết (10 bản ghi) ────────────────
  console.log('Seeding 10 purchase orders...')
  const nccCodes = ['NCC001', 'NCC002', 'NCC003', 'NCC005']
  for (let i = 1; i <= 10; i++) {
    const soPhieu = `PMH${i.toString().padStart(7, '0')}`
    const randomItemsCount = Math.floor(Math.random() * 3) + 1
    const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, randomItemsCount)
    
    let tongTien = 0
    const items = selectedProducts.map(p => {
      const soLuong = Math.floor(Math.random() * 5) + 5
      const thanhTien = Number(p.donGiaNhap) * soLuong
      tongTien += thanhTien
      return { maSP: p.maSP, soLuong, donGia: p.donGiaNhap, thanhTien }
    })

    await prisma.phieuMuaHang.upsert({
      where: { soPhieu },
      update: {},
      create: {
        soPhieu,
        maNCC: nccCodes[Math.floor(Math.random() * nccCodes.length)],
        tongTien,
        ngayLap: new Date(2026, 3, Math.floor(Math.random() * 30) + 1),
        chiTietMuaHang: {
          create: items.map(item => ({
            maSP: item.maSP,
            soLuong: item.soLuong,
            donGia: item.donGia,
            thanhTien: item.thanhTien
          }))
        }
      }
    })
  }

  // ── 10. Phiếu Dịch Vụ & Chi Tiết (30 bản ghi) ────────────────
  console.log('Seeding 30 service vouchers...')
  for (let i = 1; i <= 30; i++) {
    const soPhieu = `PDV${i.toString().padStart(7, '0')}`
    const randomItemsCount = Math.floor(Math.random() * 2) + 1
    const selectedServices = [...serviceTypes].sort(() => 0.5 - Math.random()).slice(0, randomItemsCount)

    let tongTien = 0
    let tongTraTruoc = 0
    const items = selectedServices.map((s, idx) => {
      const soLuong = Math.floor(Math.random() * 2) + 1
      const thanhTien = Number(s.donGiaDV) * soLuong
      const traTruoc = Math.floor(thanhTien * 0.5)
      tongTien += thanhTien
      tongTraTruoc += traTruoc
      return {
        stt: idx + 1,
        maDV: s.maDV,
        donGiaDV: s.donGiaDV,
        soLuong,
        thanhTien,
        traTruoc,
        conLai: thanhTien - traTruoc
      }
    })

    await prisma.phieuDichVu.upsert({
      where: { soPhieu },
      update: {},
      create: {
        soPhieu,
        tenKhachHang: getRandomName(),
        soDienThoai: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
        tongTien,
        tongTraTruoc,
        tongConLai: tongTien - tongTraTruoc,
        tinhTrang: Math.random() > 0.5 ? 'HoanThanh' : 'ChuaHoanThanh',
        ngayLap: new Date(2026, 3, Math.floor(Math.random() * 30) + 1),
        chiTietDichVu: {
          create: items.map(item => ({
            stt: item.stt,
            maDV: item.maDV,
            donGiaDV: item.donGiaDV,
            donGiaDuocTinh: item.donGiaDV,
            soLuong: item.soLuong,
            thanhTien: item.thanhTien,
            traTruoc: item.traTruoc,
            conLai: item.conLai
          }))
        }
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
