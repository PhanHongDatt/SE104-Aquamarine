-- AlterTable: BaoCaoTonKho defaults
ALTER TABLE "BaoCaoTonKho" ALTER COLUMN "tonDau" SET DEFAULT 0;
ALTER TABLE "BaoCaoTonKho" ALTER COLUMN "slMuaVao" SET DEFAULT 0;
ALTER TABLE "BaoCaoTonKho" ALTER COLUMN "slBanRa" SET DEFAULT 0;
ALTER TABLE "BaoCaoTonKho" ALTER COLUMN "tonCuoi" SET DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- CHECK CONSTRAINTS theo báo cáo đồ án
-- ═══════════════════════════════════════════════════════════════

-- LoaiSanPham: PhanTramLoiNhuan 0% đến 100% (QĐ2)
ALTER TABLE "LoaiSanPham" ADD CONSTRAINT chk_lsp_loinhuan CHECK ("phanTramLoiNhuan" >= 0 AND "phanTramLoiNhuan" <= 100);

-- SanPham: trongLuong > 0, tonToiThieu >= 0, tonKho >= 0, donGiaNhap > 0, donGiaBan > 0 (QĐ3)
ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_trongluong CHECK ("trongLuong" > 0);
ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_tontoithieu CHECK ("tonToiThieu" >= 0);
ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_tonkho CHECK ("tonKho" >= 0);
ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_dongianhap CHECK ("donGiaNhap" > 0);
ALTER TABLE "SanPham" ADD CONSTRAINT chk_sp_dongiaban CHECK ("donGiaBan" > 0);

-- PhieuBanHang: tongTien >= 0 (QĐ4)
ALTER TABLE "PhieuBanHang" ADD CONSTRAINT chk_pbh_tongtien CHECK ("tongTien" >= 0);

-- ChiTietBanHang: soLuong > 0, donGia > 0, thanhTien >= 0 (QĐ4)
ALTER TABLE "ChiTietBanHang" ADD CONSTRAINT chk_ctbh_soluong CHECK ("soLuong" > 0);
ALTER TABLE "ChiTietBanHang" ADD CONSTRAINT chk_ctbh_dongia CHECK ("donGia" > 0);
ALTER TABLE "ChiTietBanHang" ADD CONSTRAINT chk_ctbh_thanhtien CHECK ("thanhTien" >= 0);

-- PhieuMuaHang: tongTien >= 0 (QĐ5)
ALTER TABLE "PhieuMuaHang" ADD CONSTRAINT chk_pmh_tongtien CHECK ("tongTien" >= 0);

-- ChiTietMuaHang: soLuong > 0, donGia > 0, thanhTien >= 0 (QĐ5)
ALTER TABLE "ChiTietMuaHang" ADD CONSTRAINT chk_ctmh_soluong CHECK ("soLuong" > 0);
ALTER TABLE "ChiTietMuaHang" ADD CONSTRAINT chk_ctmh_dongia CHECK ("donGia" > 0);
ALTER TABLE "ChiTietMuaHang" ADD CONSTRAINT chk_ctmh_thanhtien CHECK ("thanhTien" >= 0);

-- LoaiDichVu: donGiaDV >= 0 (QĐ6)
ALTER TABLE "LoaiDichVu" ADD CONSTRAINT chk_ldv_dongiadv CHECK ("donGiaDV" >= 0);

-- PhieuDichVu: tongTien >= 0, tongTraTruoc >= 0, tongConLai >= 0 (QĐ6)
ALTER TABLE "PhieuDichVu" ADD CONSTRAINT chk_pdv_tongtien CHECK ("tongTien" >= 0);
ALTER TABLE "PhieuDichVu" ADD CONSTRAINT chk_pdv_tratruoc CHECK ("tongTraTruoc" >= 0);
ALTER TABLE "PhieuDichVu" ADD CONSTRAINT chk_pdv_conlai CHECK ("tongConLai" >= 0);

-- ChiTietDichVu: donGiaDV >= 0, chiPhiPhatSinh >= 0, donGiaDuocTinh > 0, soLuong > 0, thanhTien >= 0, traTruoc >= 0, conLai >= 0 (QĐ6)
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_dongiadv CHECK ("donGiaDV" >= 0);
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_chiphi CHECK ("chiPhiPhatSinh" >= 0);
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_dongiadt CHECK ("donGiaDuocTinh" > 0);
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_soluong CHECK ("soLuong" > 0);
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_thanhtien CHECK ("thanhTien" >= 0);
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_tratruoc CHECK ("traTruoc" >= 0);
ALTER TABLE "ChiTietDichVu" ADD CONSTRAINT chk_ctdv_conlai CHECK ("conLai" >= 0);

-- BaoCaoTonKho: tonDau >= 0, slMuaVao >= 0, slBanRa >= 0, tonCuoi >= 0 (QĐ8)
ALTER TABLE "BaoCaoTonKho" ADD CONSTRAINT chk_bctk_tondau CHECK ("tonDau" >= 0);
ALTER TABLE "BaoCaoTonKho" ADD CONSTRAINT chk_bctk_mua CHECK ("slMuaVao" >= 0);
ALTER TABLE "BaoCaoTonKho" ADD CONSTRAINT chk_bctk_ban CHECK ("slBanRa" >= 0);
ALTER TABLE "BaoCaoTonKho" ADD CONSTRAINT chk_bctk_toncuoi CHECK ("tonCuoi" >= 0);

-- BaoCaoDoanhThu: dtBanHang >= 0, dtDichVu >= 0, tongDT >= 0 (QĐ10)
ALTER TABLE "BaoCaoDoanhThu" ADD CONSTRAINT chk_bcdt_banhang CHECK ("dtBanHang" >= 0);
ALTER TABLE "BaoCaoDoanhThu" ADD CONSTRAINT chk_bcdt_dichvu CHECK ("dtDichVu" >= 0);
ALTER TABLE "BaoCaoDoanhThu" ADD CONSTRAINT chk_bcdt_tong CHECK ("tongDT" >= 0);

-- BangPhanQuyen: hanhDong IN ('XEM','THEM','SUA','XOA')
ALTER TABLE "BangPhanQuyen" ADD CONSTRAINT chk_bpq_hanhdong CHECK ("hanhDong" IN ('XEM', 'THEM', 'SUA', 'XOA'));

-- ThamSo: phanTramLoiNhuanToiThieu 0-100, soLuongTonKhoToiThieu 0-1000, tiLeTraTruocToiThieu 0-100 (QĐ11)
ALTER TABLE "ThamSo" ADD CONSTRAINT chk_ts_loinhuan CHECK ("phanTramLoiNhuanToiThieu" >= 0 AND "phanTramLoiNhuanToiThieu" <= 100);
ALTER TABLE "ThamSo" ADD CONSTRAINT chk_ts_tonkho CHECK ("soLuongTonKhoToiThieu" >= 0 AND "soLuongTonKhoToiThieu" <= 1000);
ALTER TABLE "ThamSo" ADD CONSTRAINT chk_ts_tratruoc CHECK ("tiLeTraTruocToiThieu" >= 0 AND "tiLeTraTruocToiThieu" <= 100);
