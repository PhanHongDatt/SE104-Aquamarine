-- CreateEnum
CREATE TYPE "HamLuong" AS ENUM ('K24', 'K22', 'K18', 'K14', 'K10');

-- CreateEnum
CREATE TYPE "NhomDichVu" AS ENUM ('GiaCong', 'KiemDinh');

-- CreateEnum
CREATE TYPE "TinhTrangDichVu" AS ENUM ('HoanThanh', 'ChuaHoanThanh');

-- CreateEnum
CREATE TYPE "HangKhachHang" AS ENUM ('Thuong', 'Bac', 'Vang', 'KimCuong');

-- CreateTable
CREATE TABLE "DonViTinh" (
    "maDVT" CHAR(6) NOT NULL,
    "tenDVT" VARCHAR(100) NOT NULL,
    "dinhLuong" DECIMAL(10,4),

    CONSTRAINT "DonViTinh_pkey" PRIMARY KEY ("maDVT")
);

-- CreateTable
CREATE TABLE "LoaiSanPham" (
    "maLSP" CHAR(6) NOT NULL,
    "tenLSP" VARCHAR(100) NOT NULL,
    "maDVT" CHAR(6) NOT NULL,
    "phanTramLoiNhuan" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoaiSanPham_pkey" PRIMARY KEY ("maLSP")
);

-- CreateTable
CREATE TABLE "SanPham" (
    "maSP" CHAR(5) NOT NULL,
    "tenSP" VARCHAR(200) NOT NULL,
    "maLSP" CHAR(6) NOT NULL,
    "hamLuong" "HamLuong" NOT NULL,
    "trongLuong" DECIMAL(10,3) NOT NULL,
    "maDVT" CHAR(6) NOT NULL,
    "tonToiThieu" INTEGER NOT NULL DEFAULT 0,
    "tonKho" INTEGER NOT NULL DEFAULT 0,
    "donGiaNhap" DECIMAL(18,0) NOT NULL,
    "donGiaBan" DECIMAL(18,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SanPham_pkey" PRIMARY KEY ("maSP")
);

-- CreateTable
CREATE TABLE "NhaCungCap" (
    "maNCC" CHAR(6) NOT NULL,
    "tenNCC" VARCHAR(200) NOT NULL,
    "diaChi" VARCHAR(500) NOT NULL,
    "soDienThoai" VARCHAR(20) NOT NULL,
    "nguoiLienHe" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NhaCungCap_pkey" PRIMARY KEY ("maNCC")
);

-- CreateTable
CREATE TABLE "KhachHang" (
    "maKH" CHAR(6) NOT NULL,
    "hoTen" VARCHAR(200) NOT NULL,
    "soDienThoai" VARCHAR(20) NOT NULL,
    "email" VARCHAR(200),
    "diaChi" VARCHAR(500),
    "ngaySinh" TIMESTAMP(3),
    "hangThanhVien" "HangKhachHang" NOT NULL DEFAULT 'Thuong',
    "ghiChu" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KhachHang_pkey" PRIMARY KEY ("maKH")
);

-- CreateTable
CREATE TABLE "PhieuBanHang" (
    "soPhieu" CHAR(10) NOT NULL,
    "ngayLap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenKhachHang" VARCHAR(200),
    "tongTien" DECIMAL(18,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhieuBanHang_pkey" PRIMARY KEY ("soPhieu")
);

-- CreateTable
CREATE TABLE "ChiTietBanHang" (
    "soPhieu" CHAR(10) NOT NULL,
    "maSP" CHAR(5) NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "donGia" DECIMAL(18,0) NOT NULL,
    "thanhTien" DECIMAL(18,0) NOT NULL,

    CONSTRAINT "ChiTietBanHang_pkey" PRIMARY KEY ("soPhieu","maSP")
);

-- CreateTable
CREATE TABLE "PhieuMuaHang" (
    "soPhieu" CHAR(10) NOT NULL,
    "ngayLap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maNCC" CHAR(6) NOT NULL,
    "tongTien" DECIMAL(18,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhieuMuaHang_pkey" PRIMARY KEY ("soPhieu")
);

-- CreateTable
CREATE TABLE "ChiTietMuaHang" (
    "soPhieu" CHAR(10) NOT NULL,
    "maSP" CHAR(5) NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "donGia" DECIMAL(18,0) NOT NULL,
    "thanhTien" DECIMAL(18,0) NOT NULL,

    CONSTRAINT "ChiTietMuaHang_pkey" PRIMARY KEY ("soPhieu","maSP")
);

-- CreateTable
CREATE TABLE "LoaiDichVu" (
    "maDV" CHAR(6) NOT NULL,
    "tenDV" VARCHAR(200) NOT NULL,
    "donGiaDV" DECIMAL(18,0) NOT NULL,
    "nhomDV" "NhomDichVu" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoaiDichVu_pkey" PRIMARY KEY ("maDV")
);

-- CreateTable
CREATE TABLE "PhieuDichVu" (
    "soPhieu" CHAR(10) NOT NULL,
    "ngayLap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenKhachHang" VARCHAR(200) NOT NULL,
    "soDienThoai" VARCHAR(20),
    "tongTien" DECIMAL(18,0) NOT NULL,
    "tongTraTruoc" DECIMAL(18,0) NOT NULL,
    "tongConLai" DECIMAL(18,0) NOT NULL,
    "tinhTrang" "TinhTrangDichVu" NOT NULL DEFAULT 'ChuaHoanThanh',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhieuDichVu_pkey" PRIMARY KEY ("soPhieu")
);

-- CreateTable
CREATE TABLE "ChiTietDichVu" (
    "soPhieu" CHAR(10) NOT NULL,
    "stt" INTEGER NOT NULL,
    "maDV" CHAR(6) NOT NULL,
    "donGiaDV" DECIMAL(18,0) NOT NULL,
    "chiPhiPhatSinh" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "donGiaDuocTinh" DECIMAL(18,0) NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "thanhTien" DECIMAL(18,0) NOT NULL,
    "traTruoc" DECIMAL(18,0) NOT NULL,
    "conLai" DECIMAL(18,0) NOT NULL,
    "ngayGiao" TIMESTAMP(3),
    "ketQua" VARCHAR(200),
    "soChungThu" VARCHAR(100),

    CONSTRAINT "ChiTietDichVu_pkey" PRIMARY KEY ("soPhieu","stt")
);

-- CreateTable
CREATE TABLE "BaoCaoTonKho" (
    "ngay" INTEGER NOT NULL,
    "thang" INTEGER NOT NULL,
    "nam" INTEGER NOT NULL,
    "maSP" CHAR(5) NOT NULL,
    "tonDau" INTEGER NOT NULL,
    "slMuaVao" INTEGER NOT NULL,
    "slBanRa" INTEGER NOT NULL,
    "tonCuoi" INTEGER NOT NULL,

    CONSTRAINT "BaoCaoTonKho_pkey" PRIMARY KEY ("ngay","thang","nam","maSP")
);

-- CreateTable
CREATE TABLE "BaoCaoDoanhThu" (
    "ngay" INTEGER NOT NULL,
    "thang" INTEGER NOT NULL,
    "nam" INTEGER NOT NULL,
    "dtBanHang" DECIMAL(18,0) NOT NULL,
    "dtDichVu" DECIMAL(18,0) NOT NULL,
    "tongDT" DECIMAL(18,0) NOT NULL,

    CONSTRAINT "BaoCaoDoanhThu_pkey" PRIMARY KEY ("ngay","thang","nam")
);

-- CreateTable
CREATE TABLE "ChucNang" (
    "maChucNang" CHAR(6) NOT NULL,
    "tenChucNang" VARCHAR(200) NOT NULL,
    "tenManHinhDuocLoad" VARCHAR(300) NOT NULL,

    CONSTRAINT "ChucNang_pkey" PRIMARY KEY ("maChucNang")
);

-- CreateTable
CREATE TABLE "NhomNguoiDung" (
    "maNhom" CHAR(6) NOT NULL,
    "tenNhom" VARCHAR(100) NOT NULL,

    CONSTRAINT "NhomNguoiDung_pkey" PRIMARY KEY ("maNhom")
);

-- CreateTable
CREATE TABLE "BangPhanQuyen" (
    "maNhom" CHAR(6) NOT NULL,
    "maChucNang" CHAR(6) NOT NULL,

    CONSTRAINT "BangPhanQuyen_pkey" PRIMARY KEY ("maNhom","maChucNang")
);

-- CreateTable
CREATE TABLE "NguoiDung" (
    "maND" CHAR(6) NOT NULL,
    "tenDangNhap" VARCHAR(50) NOT NULL,
    "matKhau" VARCHAR(255) NOT NULL,
    "hoTen" VARCHAR(200) NOT NULL,
    "maNhom" CHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("maND")
);

-- CreateTable
CREATE TABLE "ThamSo" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "phanTramLoiNhuanToiThieu" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "soLuongTonKhoToiThieu" INTEGER NOT NULL DEFAULT 1,
    "tiLeTraTruocToiThieu" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThamSo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonViTinh_tenDVT_key" ON "DonViTinh"("tenDVT");

-- CreateIndex
CREATE UNIQUE INDEX "LoaiSanPham_tenLSP_key" ON "LoaiSanPham"("tenLSP");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_soDienThoai_key" ON "KhachHang"("soDienThoai");

-- CreateIndex
CREATE UNIQUE INDEX "LoaiDichVu_tenDV_key" ON "LoaiDichVu"("tenDV");

-- CreateIndex
CREATE UNIQUE INDEX "ChucNang_tenChucNang_key" ON "ChucNang"("tenChucNang");

-- CreateIndex
CREATE UNIQUE INDEX "NhomNguoiDung_tenNhom_key" ON "NhomNguoiDung"("tenNhom");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_tenDangNhap_key" ON "NguoiDung"("tenDangNhap");

-- AddForeignKey
ALTER TABLE "LoaiSanPham" ADD CONSTRAINT "LoaiSanPham_maDVT_fkey" FOREIGN KEY ("maDVT") REFERENCES "DonViTinh"("maDVT") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPham" ADD CONSTRAINT "SanPham_maLSP_fkey" FOREIGN KEY ("maLSP") REFERENCES "LoaiSanPham"("maLSP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPham" ADD CONSTRAINT "SanPham_maDVT_fkey" FOREIGN KEY ("maDVT") REFERENCES "DonViTinh"("maDVT") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietBanHang" ADD CONSTRAINT "ChiTietBanHang_soPhieu_fkey" FOREIGN KEY ("soPhieu") REFERENCES "PhieuBanHang"("soPhieu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietBanHang" ADD CONSTRAINT "ChiTietBanHang_maSP_fkey" FOREIGN KEY ("maSP") REFERENCES "SanPham"("maSP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuMuaHang" ADD CONSTRAINT "PhieuMuaHang_maNCC_fkey" FOREIGN KEY ("maNCC") REFERENCES "NhaCungCap"("maNCC") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietMuaHang" ADD CONSTRAINT "ChiTietMuaHang_soPhieu_fkey" FOREIGN KEY ("soPhieu") REFERENCES "PhieuMuaHang"("soPhieu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietMuaHang" ADD CONSTRAINT "ChiTietMuaHang_maSP_fkey" FOREIGN KEY ("maSP") REFERENCES "SanPham"("maSP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT "ChiTietDichVu_soPhieu_fkey" FOREIGN KEY ("soPhieu") REFERENCES "PhieuDichVu"("soPhieu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT "ChiTietDichVu_maDV_fkey" FOREIGN KEY ("maDV") REFERENCES "LoaiDichVu"("maDV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaoCaoTonKho" ADD CONSTRAINT "BaoCaoTonKho_maSP_fkey" FOREIGN KEY ("maSP") REFERENCES "SanPham"("maSP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BangPhanQuyen" ADD CONSTRAINT "BangPhanQuyen_maNhom_fkey" FOREIGN KEY ("maNhom") REFERENCES "NhomNguoiDung"("maNhom") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BangPhanQuyen" ADD CONSTRAINT "BangPhanQuyen_maChucNang_fkey" FOREIGN KEY ("maChucNang") REFERENCES "ChucNang"("maChucNang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NguoiDung" ADD CONSTRAINT "NguoiDung_maNhom_fkey" FOREIGN KEY ("maNhom") REFERENCES "NhomNguoiDung"("maNhom") ON DELETE RESTRICT ON UPDATE CASCADE;

