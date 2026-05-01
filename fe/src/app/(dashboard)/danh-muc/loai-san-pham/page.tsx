import { getDanhSachLoaiSanPham } from "@/actions/danh-muc";
import type { LoaiSanPham } from "@/types/model";
import { Tag } from "lucide-react";

export const metadata = {
  title: "Loại Sản Phẩm – Quản Lý Vàng Bạc Đá Quý",
};

const MOCK_LOAI_SAN_PHAM: LoaiSanPham[] = [
  {
    maLSP: "LSP001",
    tenLSP: "Vàng 9999",
    maDVT: "DVT001",
    phanTramLoiNhuan: 10.5,
    donViTinh: {
      maDVT: "DVT001",
      tenDVT: "Chỉ",
    },
  },
  {
    maLSP: "LSP002",
    tenLSP: "Vàng 18K",
    maDVT: "DVT001",
    phanTramLoiNhuan: 12.0,
    donViTinh: {
      maDVT: "DVT001",
      tenDVT: "Chỉ",
    },
  },
  {
    maLSP: "LSP003",
    tenLSP: "Bạc 925",
    maDVT: "DVT002",
    phanTramLoiNhuan: 8.0,
    donViTinh: {
      maDVT: "DVT002",
      tenDVT: "Gram",
    },
  },
  {
    maLSP: "LSP004",
    tenLSP: "Kim Cương",
    maDVT: "DVT004",
    phanTramLoiNhuan: 25.0,
    donViTinh: {
      maDVT: "DVT004",
      tenDVT: "Viên",
    },
  },
  {
    maLSP: "LSP005",
    tenLSP: "Đá Quý Tổng Hợp",
    maDVT: "DVT004",
    phanTramLoiNhuan: 30.0,
    donViTinh: {
      maDVT: "DVT004",
      tenDVT: "Viên",
    },
  },
];

export default async function LoaiSanPhamPage() {
  let loaiSanPhams: LoaiSanPham[] = MOCK_LOAI_SAN_PHAM;

  try {
    console.log("=== LOAD API ===");

    const data = await getDanhSachLoaiSanPham();

    console.log("API DATA:", data);

    if (Array.isArray(data) && data.length > 0) {
      loaiSanPhams = data;
    }
  } catch (error) {
    console.error("LOAD LSP ERROR:", error);

    // fallback mock data
    loaiSanPhams = MOCK_LOAI_SAN_PHAM;
  }

  console.log("FINAL DATA:", loaiSanPhams);

  return (
    <div className="p-6 space-y-6 bg-red-50 min-h-screen">
      {/* DEBUG */}
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <h2 className="font-bold text-black mb-2">DEBUG DATA</h2>

        <pre className="text-xs text-black overflow-auto">
          {JSON.stringify(loaiSanPhams, null, 2)}
        </pre>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-blue-500" />
            Quản Lý Loại Sản Phẩm
          </h1>

          <p className="text-sm text-black mt-1">
            Tổng cộng{" "}
            <span className="font-semibold">
              {loaiSanPhams.length}
            </span>{" "}
            loại sản phẩm
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
          + Thêm loại sản phẩm
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-black shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black bg-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-black">
                  Mã loại SP
                </th>

                <th className="text-left px-4 py-3 font-semibold text-black">
                  Tên loại sản phẩm
                </th>

                <th className="text-left px-4 py-3 font-semibold text-black">
                  Đơn vị tính
                </th>

                <th className="text-right px-4 py-3 font-semibold text-black">
                  % Lợi nhuận
                </th>
              </tr>
            </thead>

            <tbody>
              {loaiSanPhams.map((lsp) => (
                <tr
                  key={lsp.maLSP}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-black">
                    {lsp.maLSP}
                  </td>

                  <td className="px-4 py-3 font-medium text-black">
                    {lsp.tenLSP}
                  </td>

                  <td className="px-4 py-3 text-black">
                    {lsp.donViTinh?.tenDVT ?? lsp.maDVT}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-green-600">
                      {Number(lsp.phanTramLoiNhuan || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPTY STATE */}
      {loaiSanPhams.length === 0 && (
        <div className="p-6 bg-red-100 border border-red-300 rounded-lg text-black">
          Không có dữ liệu loại sản phẩm
        </div>
      )}
    </div>
  );
}