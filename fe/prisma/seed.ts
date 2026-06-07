import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  if (process.argv.includes('--if-empty') && await prisma.nhomNguoiDung.count() > 0) {
    console.log('Database already initialized; skipping seed.')
    return
  }

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
    { maSP: 'SP001', tenSP: 'Nhẫn Vàng 9999 Trơn', maLSP: 'LSP001', hamLuong: 'K24', trongLuong: 2.5, maDVT: 'DVT001', tonKho: 50, donGiaNhap: 18500000, donGiaBan: 20450000 },
    { maSP: 'SP002', tenSP: 'Lắc Tay Vàng 18K Đính Đá', maLSP: 'LSP002', hamLuong: 'K18', trongLuong: 5.0, maDVT: 'DVT001', tonKho: 30, donGiaNhap: 32000000, donGiaBan: 36000000 },
    { maSP: 'SP003', tenSP: 'Dây Chuyền Bạc 925', maLSP: 'LSP003', hamLuong: 'K18', trongLuong: 8.0, maDVT: 'DVT002', tonKho: 100, donGiaNhap: 450000, donGiaBan: 490000 },
    { maSP: 'SP004', tenSP: 'Nhẫn Kim Cương Solitaire 0.5ct', maLSP: 'LSP004', hamLuong: 'K18', trongLuong: 3.2, maDVT: 'DVT004', tonKho: 15, donGiaNhap: 85000000, donGiaBan: 106000000 },
    { maSP: 'SP005', tenSP: 'Bông Tai Vàng 9999', maLSP: 'LSP001', hamLuong: 'K24', trongLuong: 1.8, maDVT: 'DVT001', tonKho: 40, donGiaNhap: 13500000, donGiaBan: 14900000 },
    { maSP: 'SP009', tenSP: 'Nhẫn Cưới Kim Cương Đôi', maLSP: 'LSP004', hamLuong: 'K18', trongLuong: 6.5, maDVT: 'DVT004', tonKho: 10, donGiaNhap: 150000000, donGiaBan: 187500000 },
    { maSP: 'SP010', tenSP: 'Dây Chuyền Vàng 24K 5 Chỉ', maLSP: 'LSP001', hamLuong: 'K24', trongLuong: 18.75, maDVT: 'DVT001', tonKho: 5, donGiaNhap: 42000000, donGiaBan: 46200000 },
    { maSP: 'SP011', tenSP: 'Vòng Cổ Ngọc Trai Biển', maLSP: 'LSP005', hamLuong: 'K14', trongLuong: 15.0, maDVT: 'DVT004', tonKho: 20, donGiaNhap: 25000000, donGiaBan: 32500000 },
  ]

  for (const p of products) {
    await prisma.sanPham.upsert({ where: { maSP: p.maSP }, update: {}, create: p as any })
  }
  await prisma.$executeRaw`
    UPDATE "SanPham" sp
    SET "maDVT" = lsp."maDVT"
    FROM "LoaiSanPham" lsp
    WHERE sp."maLSP" = lsp."maLSP" AND sp."maDVT" <> lsp."maDVT"
  `
  await prisma.$executeRawUnsafe('ALTER TABLE "SanPham" DROP CONSTRAINT IF EXISTS chk_sp_tontoithieu')
  await prisma.$executeRawUnsafe('UPDATE "SanPham" SET "tonToiThieu" = LEAST(1000, GREATEST(0, "tonToiThieu"))')
  await prisma.$executeRawUnsafe('ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_tontoithieu CHECK ("tonToiThieu" >= 0 AND "tonToiThieu" <= 1000)')

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
  await prisma.nhomNguoiDung.upsert({ where: { maNhom: 'KETOAN' }, update: {}, create: { maNhom: 'KETOAN', tenNhom: 'KE_TOAN' } })
  const [adminPassword, staffPassword, accountantPassword] = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Nhanvien@1', 10),
    bcrypt.hash('Ketoan@1', 10),
  ])
  await prisma.nguoiDung.upsert({
    where: { tenDangNhap: 'admin' },
    update: {},
    create: { maND: 'ND0001', tenDangNhap: 'admin', matKhau: adminPassword, hoTen: 'Nguyễn Quản Lý', maNhom: 'QUANLY' }
  })
  await prisma.nguoiDung.upsert({
    where: { tenDangNhap: 'nhanvien' },
    update: {},
    create: { maND: 'ND0002', tenDangNhap: 'nhanvien', matKhau: staffPassword, hoTen: 'Trần Nhân Viên', maNhom: 'NHANVI' }
  })
  await prisma.nguoiDung.upsert({
    where: { tenDangNhap: 'ketoan' },
    update: {},
    create: { maND: 'ND0003', tenDangNhap: 'ketoan', matKhau: accountantPassword, hoTen: 'Đặng Kế Toán', maNhom: 'KETOAN' }
  })

  const chucNangs = [
    { maChucNang: 'DM_DVT', tenChucNang: 'Quản lý đơn vị tính', tenManHinhDuocLoad: '/admin/danh-muc/don-vi-tinh' },
    { maChucNang: 'DM_LSP', tenChucNang: 'Quản lý loại sản phẩm', tenManHinhDuocLoad: '/admin/danh-muc/loai-san-pham' },
    { maChucNang: 'DM_SP', tenChucNang: 'Quản lý sản phẩm', tenManHinhDuocLoad: '/admin/danh-muc/san-pham' },
    { maChucNang: 'DM_KH', tenChucNang: 'Quản lý khách hàng', tenManHinhDuocLoad: '/admin/danh-muc/khach-hang' },
    { maChucNang: 'DM_NCC', tenChucNang: 'Quản lý nhà cung cấp', tenManHinhDuocLoad: '/admin/danh-muc/nha-cung-cap' },
    { maChucNang: 'GD_BAN', tenChucNang: 'Lập phiếu bán hàng', tenManHinhDuocLoad: '/admin/giao-dich/ban-hang' },
    { maChucNang: 'GD_MUA', tenChucNang: 'Lập phiếu mua hàng', tenManHinhDuocLoad: '/admin/giao-dich/mua-hang' },
    { maChucNang: 'DV_LAP', tenChucNang: 'Lập phiếu dịch vụ', tenManHinhDuocLoad: '/admin/dich-vu/phieu-dich-vu/tao-moi' },
    { maChucNang: 'DV_LDV', tenChucNang: 'Quản lý loại dịch vụ', tenManHinhDuocLoad: '/admin/dich-vu/loai-dich-vu' },
    { maChucNang: 'DV_TRA', tenChucNang: 'Tra cứu phiếu dịch vụ', tenManHinhDuocLoad: '/admin/dich-vu/phieu-dich-vu' },
    { maChucNang: 'BC_TON', tenChucNang: 'Báo cáo tồn kho', tenManHinhDuocLoad: '/admin/bao-cao/ton-kho' },
    { maChucNang: 'BC_DTH', tenChucNang: 'Báo cáo doanh thu', tenManHinhDuocLoad: '/admin/bao-cao/doanh-thu' },
    { maChucNang: 'HT_USR', tenChucNang: 'Quản lý tài khoản người dùng', tenManHinhDuocLoad: '/admin/tai-khoan' },
    { maChucNang: 'HT_PHQ', tenChucNang: 'Phân quyền người dùng', tenManHinhDuocLoad: '/admin/cai-dat/phan-quyen' },
    { maChucNang: 'HT_QDI', tenChucNang: 'Thay đổi quy định', tenManHinhDuocLoad: '/admin/cai-dat/quy-dinh' },
    { maChucNang: 'HT_BAK', tenChucNang: 'Sao lưu và phục hồi dữ liệu', tenManHinhDuocLoad: 'scripts/db-backup.js;scripts/db-restore.js' },
  ]

  for (const cn of chucNangs) {
    await prisma.chucNang.upsert({
      where: { maChucNang: cn.maChucNang },
      update: { tenChucNang: cn.tenChucNang, tenManHinhDuocLoad: cn.tenManHinhDuocLoad },
      create: cn,
    })
  }

  // ── Phân quyền chi tiết theo hành động ─────────────────────
  // Định nghĩa hành động hợp lệ cho từng chức năng
  const ACTIONS = ['XEM', 'THEM', 'SUA', 'XOA'] as const
  const actionMap: Record<string, readonly string[]> = {
    DM_DVT: ['XEM', 'THEM', 'SUA', 'XOA'],
    DM_LSP: ['XEM', 'THEM', 'SUA', 'XOA'],
    DM_SP:  ['XEM', 'THEM', 'SUA', 'XOA'],
    DM_KH:  ['XEM', 'THEM', 'SUA', 'XOA'],
    DM_NCC: ['XEM', 'THEM', 'SUA', 'XOA'],
    GD_BAN: ['XEM', 'THEM'],
    GD_MUA: ['XEM', 'THEM'],
    DV_LAP: ['XEM', 'THEM'],
    DV_LDV: ['XEM', 'THEM', 'SUA', 'XOA'],
    DV_TRA: ['XEM', 'SUA'],
    BC_TON: ['XEM'],
    BC_DTH: ['XEM'],
    HT_USR: ['XEM', 'THEM', 'SUA', 'XOA'],
    HT_PHQ: ['XEM', 'SUA'],
    HT_QDI: ['XEM', 'SUA'],
    HT_BAK: ['XEM', 'THEM', 'SUA'],
  }

  // Quyền nhân viên: theo báo cáo đồ án
  // QĐ1: Đơn vị tính → chỉ Xem
  // QĐ2: Loại sản phẩm → chỉ Xem
  // QĐ3: Sản phẩm → Xem, Thêm, Sửa
  // QĐ4: Bán hàng → Xem, Thêm
  // QĐ5: Mua hàng → Xem, Thêm
  // QĐ6: Lập phiếu DV → Xem, Thêm
  // QĐ7: Tra cứu DV → Xem, Sửa (cập nhật giao)
  // QĐ8: Báo cáo tồn kho → Xem
  // QĐ9: Nhà cung cấp → chỉ Xem
  // QĐ10: Báo cáo doanh thu → không có quyền
  // QĐ11: Quy định/Phân quyền/TK/Sao lưu → không có quyền
  const staffActionMap: Record<string, string[]> = {
    DM_DVT: ['XEM'],
    DM_LSP: ['XEM'],
    DM_SP:  ['XEM', 'THEM', 'SUA'],
    DM_KH:  ['XEM', 'THEM', 'SUA'],
    DM_NCC: ['XEM'],
    GD_BAN: ['XEM', 'THEM'],
    GD_MUA: ['XEM', 'THEM'],
    DV_LAP: ['XEM', 'THEM'],
    DV_TRA: ['XEM', 'SUA'],
    BC_TON: ['XEM'],
  }

  // Quyền kế toán: chỉ xem báo cáo + tra cứu dịch vụ
  const accountantActionMap: Record<string, string[]> = {
    BC_DTH: ['XEM'],
    BC_TON: ['XEM'],
    DV_TRA: ['XEM', 'SUA'],
  }

  // Chỉ tạo bộ quyền mặc định cho CSDL mới. Không ghi đè cấu hình quản lý đã lưu.
  if (await prisma.bangPhanQuyen.count() === 0) {
    for (const cn of chucNangs) {
      const validActions = actionMap[cn.maChucNang] || ['XEM']
      for (const action of validActions) {
        await prisma.bangPhanQuyen.create({
          data: { maNhom: 'QUANLY', maChucNang: cn.maChucNang, hanhDong: action },
        })
      }
      const staffActions = staffActionMap[cn.maChucNang]
      if (staffActions) {
        for (const action of staffActions) {
          await prisma.bangPhanQuyen.create({
            data: { maNhom: 'NHANVI', maChucNang: cn.maChucNang, hanhDong: action },
          })
        }
      }
      const accountantActions = accountantActionMap[cn.maChucNang]
      if (accountantActions) {
        for (const action of accountantActions) {
          await prisma.bangPhanQuyen.create({
            data: { maNhom: 'KETOAN', maChucNang: cn.maChucNang, hanhDong: action },
          })
        }
      }
    }
  }

  // ── 7. Tham Số ──────────────────────────────────────────────
  await prisma.thamSo.upsert({ where: { id: 1 }, update: {}, create: { id: 1, phanTramLoiNhuanToiThieu: 5.0, soLuongTonKhoToiThieu: 1, tiLeTraTruocToiThieu: 50.0 } })

  // ── Helper for Names ──────────────────────────────────────
  const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const lot = ['Văn', 'Thị', 'Minh', 'Hữu', 'Tuấn', 'Thanh', 'Bảo', 'Gia', 'Đức', 'Anh']
  const ten = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Phong', 'Giang', 'Hương', 'Inh', 'Khánh', 'Linh', 'Nam', 'Oanh', 'Phúc', 'Quang', 'Sơn', 'Thảo', 'Uyên', 'Việt', 'Yến']

  const getRandomName = () => `${ho[Math.floor(Math.random() * ho.length)]} ${lot[Math.floor(Math.random() * lot.length)]} ${ten[Math.floor(Math.random() * ten.length)]}`

  // ── 8. Khách Hàng ────────────────────────────────────────────
  const customerNames = [
    'Nguyễn Minh Châu',
    'Trần Quốc Bảo',
    'Lê Hoàng Kim',
    'Phạm Thanh Ngọc',
    'Vũ Gia Hân',
    'Đặng Bảo Anh',
    'Phan Anh Quốc',
  ]

  for (let i = 0; i < customerNames.length; i++) {
    await prisma.khachHang.upsert({
      where: { maKH: `KH${(i + 1).toString().padStart(4, '0')}` },
      update: {},
      create: {
        maKH: `KH${(i + 1).toString().padStart(4, '0')}`,
        hoTen: customerNames[i],
        soDienThoai: `09${(10000000 + i * 234567).toString().slice(0, 8)}`,
        email: `khachhang${i + 1}@aquamarine.local`,
        diaChi: `${i + 12} Nguyễn Huệ, Quận ${i + 1}, TP.HCM`,
        hangThanhVien: i >= 4 ? 'KimCuong' : i >= 2 ? 'Vang' : i === 1 ? 'Bac' : 'Thuong',
        ghiChu: 'Khách hàng mẫu phục vụ demo và kiểm thử nghiệp vụ.',
      } as any,
    })
  }

  // ── 9. Phiếu Bán Hàng & Chi Tiết (31 bản ghi) ────────────────
  console.log('Seeding 31 sales orders...')
  for (let i = 1; i <= 31; i++) {
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

  // ── 10. Phiếu Mua Hàng & Chi Tiết (10 bản ghi) ────────────────
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

  // ── 11. Phiếu Dịch Vụ & Chi Tiết (33 bản ghi) ────────────────
  console.log('Seeding 33 service vouchers...')
  for (let i = 1; i <= 33; i++) {
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
