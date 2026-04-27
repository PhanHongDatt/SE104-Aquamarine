export interface SanPham {
  id: string;
  ten: string;
  maSp: string;
  giaMua: number;
  giaBan: number;
  tonKho: number;
  loaiSpId: string;
}

export interface LoaiSanPham {
  id: string;
  ten: string;
  phanTramLoiNhuan: number;
}

export interface NhaCungCap {
  id: string;
  ten: string;
  diaChi: string;
  sdt: string;
}
