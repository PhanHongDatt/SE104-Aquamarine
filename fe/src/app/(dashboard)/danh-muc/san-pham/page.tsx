import { getDanhSachSanPham } from "@/actions/danh-muc";
import type { SanPham } from "@/types/model";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

export const metadata = { title: "Sản Phẩm – Quản Lý Vàng Bạc Đá Quý" };

const HAM_LUONG_LABEL: Record<string, string> = {
  K24: "9999 (K24)", K22: "Vàng K22", K18: "Vàng K18", K14: "Vàng K14", K10: "Vàng K10",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

const MOCK_SAN_PHAM: SanPham[] = [
  { maSP: "SP001", tenSP: "Nhẫn Vàng 9999 Trơn", maLSP: "LSP001", hamLuong: "K24", trongLuong: 2.5, maDVT: "DVT001", tonToiThieu: 5, tonKho: 24, donGiaNhap: 18500000, donGiaBan: 20450000, loaiSanPham: { maLSP: "LSP001", tenLSP: "Vàng 9999", maDVT: "DVT001", phanTramLoiNhuan: 10.5 }, donViTinh: { maDVT: "DVT001", tenDVT: "Chỉ" } },
  { maSP: "SP002", tenSP: "Lắc Tay Vàng 18K Đính Đá", maLSP: "LSP002", hamLuong: "K18", trongLuong: 5.0, maDVT: "DVT001", tonToiThieu: 3, tonKho: 12, donGiaNhap: 32000000, donGiaBan: 36000000, loaiSanPham: { maLSP: "LSP002", tenLSP: "Vàng 18K", maDVT: "DVT001", phanTramLoiNhuan: 12.0 }, donViTinh: { maDVT: "DVT001", tenDVT: "Chỉ" } },
  { maSP: "SP003", tenSP: "Dây Chuyền Bạc 925", maLSP: "LSP003", hamLuong: "K18", trongLuong: 8.0, maDVT: "DVT002", tonToiThieu: 10, tonKho: 3, donGiaNhap: 450000, donGiaBan: 490000, loaiSanPham: { maLSP: "LSP003", tenLSP: "Bạc 925", maDVT: "DVT002", phanTramLoiNhuan: 8.0 }, donViTinh: { maDVT: "DVT002", tenDVT: "Gram" } },
  { maSP: "SP004", tenSP: "Nhẫn Kim Cương Solitaire 0.5ct", maLSP: "LSP004", hamLuong: "K18", trongLuong: 3.2, maDVT: "DVT003", tonToiThieu: 2, tonKho: 5, donGiaNhap: 85000000, donGiaBan: 106000000, loaiSanPham: { maLSP: "LSP004", tenLSP: "Kim Cương", maDVT: "DVT004", phanTramLoiNhuan: 25.0 }, donViTinh: { maDVT: "DVT003", tenDVT: "Cái" } },
  { maSP: "SP005", tenSP: "Bông Tai Vàng 9999", maLSP: "LSP001", hamLuong: "K24", trongLuong: 1.8, maDVT: "DVT003", tonToiThieu: 5, tonKho: 18, donGiaNhap: 13500000, donGiaBan: 14900000, loaiSanPham: { maLSP: "LSP001", tenLSP: "Vàng 9999", maDVT: "DVT001", phanTramLoiNhuan: 10.5 }, donViTinh: { maDVT: "DVT003", tenDVT: "Cái" } },
  { maSP: "SP006", tenSP: "Vòng Tay Vàng 18K Charm", maLSP: "LSP002", hamLuong: "K18", trongLuong: 4.2, maDVT: "DVT003", tonToiThieu: 3, tonKho: 9, donGiaNhap: 28000000, donGiaBan: 31360000, loaiSanPham: { maLSP: "LSP002", tenLSP: "Vàng 18K", maDVT: "DVT001", phanTramLoiNhuan: 12.0 }, donViTinh: { maDVT: "DVT003", tenDVT: "Cái" } },
  { maSP: "SP007", tenSP: "Nhẫn Đá Quý Ruby", maLSP: "LSP005", hamLuong: "K14", trongLuong: 2.8, maDVT: "DVT003", tonToiThieu: 2, tonKho: 0, donGiaNhap: 45000000, donGiaBan: 58500000, loaiSanPham: { maLSP: "LSP005", tenLSP: "Đá Quý Tổng Hợp", maDVT: "DVT004", phanTramLoiNhuan: 30.0 }, donViTinh: { maDVT: "DVT003", tenDVT: "Cái" } },
  { maSP: "SP008", tenSP: "Lắc Chân Bạc 925", maLSP: "LSP003", hamLuong: "K18", trongLuong: 12.0, maDVT: "DVT002", tonToiThieu: 5, tonKho: 22, donGiaNhap: 680000, donGiaBan: 735000, loaiSanPham: { maLSP: "LSP003", tenLSP: "Bạc 925", maDVT: "DVT002", phanTramLoiNhuan: 8.0 }, donViTinh: { maDVT: "DVT002", tenDVT: "Gram" } },
];

export default async function SanPhamPage() {
  let sanPhams: SanPham[] = [];
  let error: string | null = null;
  
  try {
    console.log("[Debug] Fetching san pham...");
    sanPhams = await getDanhSachSanPham();
    console.log("[Debug] Found", sanPhams.length, "items");
  } catch (e: any) {
    console.error("[Debug] Error fetching data:", e);
    error = e.message;
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tổng cộng <span className="font-semibold text-zinc-700">{sanPhams.length}</span> sản phẩm
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + Thêm sản phẩm
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          Lỗi: {error}. Vui lòng kiểm tra kết nối Database.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {sanPhams.length === 0 && !error ? (
            <div className="p-8 text-center text-zinc-500 italic">
              Chưa có dữ liệu sản phẩm. Hãy đảm bảo bạn đã chạy "npx prisma db seed".
            </div>
          ) : (
            <table className="w-full text-sm">
              {/* ... (table content) ... */}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
