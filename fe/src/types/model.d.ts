export interface DonViTinh {
  maDVT: string;
  tenDVT: string;
}

export interface LoaiSanPham {
  maLSP: string;
  tenLSP: string;
  maDVT: string;
  phanTramLoiNhuan: number;
  donViTinh?: DonViTinh;
}

export type HamLuong = 'K24' | 'K22' | 'K18' | 'K14' | 'K10';

export interface SanPham {
  maSP: string;
  tenSP: string;
  maLSP: string;
  hamLuong: HamLuong;
  trongLuong: number;
  maDVT: string;
  tonKho: number;
  tonToiThieu: number;
  donGiaNhap: number;
  donGiaBan: number;
  loaiSanPham?: LoaiSanPham;
  donViTinh?: DonViTinh;
}

export interface NhaCungCap {
  maNCC: string;
  tenNCC: string;
  diaChi: string;
  soDienThoai: string;
  nguoiLienHe: string;
}

export type HangKhachHang = 'Thuong' | 'Bac' | 'Vang' | 'KimCuong';

export interface KhachHang {
  maKH: string;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  diaChi?: string;
  ngaySinh?: string;
  hangThanhVien: HangKhachHang;
  ghiChu?: string;
}

export interface ChiTietBanHang {
  soPhieu: string;
  maSP: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  sanPham?: SanPham;
}

export interface PhieuBanHang {
  soPhieu: string;
  ngayLap: string;
  maKH?: string;
  tenKhachHang?: string;
  tongTien: number;
  khachHang?: KhachHang;
  chiTietBanHang?: ChiTietBanHang[];
}

export interface ChiTietMuaHang {
  soPhieu: string;
  maSP: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  sanPham?: SanPham;
}

export interface PhieuMuaHang {
  soPhieu: string;
  ngayLap: string;
  maNCC: string;
  tongTien: number;
  nhaCungCap?: NhaCungCap;
  chiTietMuaHang?: ChiTietMuaHang[];
}

export type NhomDichVu = 'GiaCong' | 'KiemDinh';
export type TinhTrangDichVu = 'HoanThanh' | 'ChuaHoanThanh';

export interface LoaiDichVu {
  maDV: string;
  tenDV: string;
  donGiaDV: number;
  nhomDV: NhomDichVu;
}

export interface NguoiDung {
  maND: string;
  tenDangNhap: string;
  hoTen: string;
  maNhom: string;
}

export interface ThamSo {
  id: number;
  phanTramLoiNhuanToiThieu: number;
  soLuongTonKhoToiThieu: number;
  tiLeTraTruocToiThieu: number;
}
