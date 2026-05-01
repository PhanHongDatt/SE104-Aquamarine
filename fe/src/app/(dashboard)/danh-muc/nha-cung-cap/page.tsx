import { getDanhSachNhaCungCap } from "@/actions/danh-muc";
import type { NhaCungCap } from "@/types/model";
import { Truck, Phone, MapPin, User } from "lucide-react";

export const metadata = { title: "Nhà Cung Cấp – Quản Lý Vàng Bạc Đá Quý" };

const MOCK_NHA_CUNG_CAP: NhaCungCap[] = [
  { maNCC: "NCC001", tenNCC: "Công ty Vàng SJC", diaChi: "79 Hàm Nghi, Q1, TP.HCM", soDienThoai: "0283822100", nguoiLienHe: "Nguyễn Văn A" },
  { maNCC: "NCC002", tenNCC: "Trang Sức DOJI", diaChi: "5 Lê Duẩn, Q1, TP.HCM", soDienThoai: "0283844555", nguoiLienHe: "Trần Thị B" },
  { maNCC: "NCC003", tenNCC: "Kim Hoàn PNJ", diaChi: "170E Phan Đăng Lưu, Phú Nhuận, TP.HCM", soDienThoai: "0283995671", nguoiLienHe: "Lê Văn C" },
  { maNCC: "NCC004", tenNCC: "Bạch Kim Jewellery", diaChi: "45 Nguyễn Trãi, Q5, TP.HCM", soDienThoai: "0287665432", nguoiLienHe: "Phạm Thị D" },
];

export default async function NhaCungCapPage() {
  let nhaCungCaps: NhaCungCap[] = MOCK_NHA_CUNG_CAP;
  try {
    const data = await getDanhSachNhaCungCap();
    if (data.length > 0) nhaCungCaps = data;
  } catch { /* fallback to mock */ }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Quản Lý Nhà Cung Cấp
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tổng cộng <span className="font-semibold text-zinc-700">{nhaCungCaps.length}</span> nhà cung cấp
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + Thêm nhà cung cấp
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {nhaCungCaps.map((ncc) => (
          <div key={ncc.maNCC} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-zinc-800 leading-tight">{ncc.tenNCC}</p>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">{ncc.maNCC}</p>
              </div>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Đang hợp tác
              </span>
            </div>
            <div className="space-y-2 text-sm text-zinc-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                <span>{ncc.diaChi}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{ncc.soDienThoai}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{ncc.nguoiLienHe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
