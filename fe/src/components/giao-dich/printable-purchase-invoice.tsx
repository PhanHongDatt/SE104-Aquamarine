"use client";

import React from "react";

interface PrintablePurchaseInvoiceProps {
  phieu: any;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export const PrintablePurchaseInvoice = React.forwardRef<
  HTMLDivElement,
  PrintablePurchaseInvoiceProps
>(({ phieu }, ref) => {
  return (
    <div
      ref={ref}
      className="print-font bg-white text-zinc-900 w-[760px] mx-auto px-8 py-8 text-[13px] leading-relaxed"
    >
      <div className="border-b border-zinc-800 pb-4 mb-5">
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">
              AQUAMARINE
            </h1>
            <p className="text-[11px] text-zinc-500 italic mt-1">
              Jewelry & Luxury Collection
            </p>
            <div className="mt-3 space-y-0.5 text-[11px] text-zinc-600">
              <p>Khu phố 6, P. Linh Trung, TP. Thủ Đức, TP. HCM</p>
              <p>Hotline: 0123 456 789</p>
              <p>Email: contact@aquamarine.vn</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <h2 className="text-3xl font-extrabold tracking-tight">
              PHIẾU MUA HÀNG
            </h2>
            <div className="mt-3 space-y-1 text-[12px]">
              <p>
                <span className="font-semibold">Số phiếu:</span> {phieu.soPhieu}
              </p>
              <p className="text-zinc-600">
                <span className="font-semibold">Ngày lập:</span>{" "}
                {new Date(phieu.ngayLap).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-5 text-[12px]">
        <div className="space-y-1.5">
          <p>
            <span className="font-semibold">Nhà cung cấp:</span>{" "}
            {phieu.nhaCungCap?.tenNCC || phieu.maNCC}
          </p>
          <p>
            <span className="font-semibold">Địa chỉ:</span>{" "}
            {phieu.nhaCungCap?.diaChi || ""}
          </p>
        </div>
        <div className="space-y-1.5 text-right">
          <p>
            <span className="font-semibold">Số điện thoại:</span>{" "}
            {phieu.nhaCungCap?.soDienThoai || ""}
          </p>
          <p>
            <span className="font-semibold">Ngày in:</span>{" "}
            {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-zinc-100">
            <th className="border border-zinc-300 px-2 py-2 text-center w-10">
              STT
            </th>
            <th className="border border-zinc-300 px-3 py-2 text-left">
              Sản phẩm
            </th>
            <th className="border border-zinc-300 px-3 py-2 text-left">
              Loại sản phẩm
            </th>
            <th className="border border-zinc-300 px-2 py-2 text-center w-14">
              SL
            </th>
            <th className="border border-zinc-300 px-2 py-2 text-center w-20">
              ĐVT
            </th>
            <th className="border border-zinc-300 px-3 py-2 text-right w-32">
              Đơn giá
            </th>
            <th className="border border-zinc-300 px-3 py-2 text-right w-36">
              Thành tiền
            </th>
          </tr>
        </thead>

        <tbody>
          {phieu.chiTietMuaHang?.map((item: any, index: number) => (
            <tr key={`${item.maSP}-${index}`}>
              <td className="border border-zinc-300 px-2 py-2 text-center">
                {index + 1}
              </td>
              <td className="border border-zinc-300 px-3 py-2 font-medium break-words">
                {item.sanPham?.tenSP}
              </td>
              <td className="border border-zinc-300 px-3 py-2 break-words">
                {item.sanPham?.loaiSanPham?.tenLSP}
              </td>
              <td className="border border-zinc-300 px-2 py-2 text-center">
                {item.soLuong}
              </td>
              <td className="border border-zinc-300 px-2 py-2 text-center">
                {item.sanPham?.donViTinh?.tenDVT}
              </td>
              <td className="border border-zinc-300 px-3 py-2 text-right whitespace-nowrap">
                {formatCurrency(Number(item.donGia))}
              </td>
              <td className="border border-zinc-300 px-3 py-2 text-right font-semibold whitespace-nowrap">
                {formatCurrency(Number(item.thanhTien))}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-zinc-50">
            <td
              colSpan={6}
              className="border border-zinc-300 px-3 py-3 text-right font-bold uppercase"
            >
              Tổng thanh toán
            </td>
            <td className="border border-zinc-300 px-3 py-3 text-right text-[15px] font-extrabold whitespace-nowrap">
              {formatCurrency(Number(phieu.tongTien))}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-10 mt-14 text-center text-[12px]">
        <div className="min-h-[120px] flex flex-col justify-between">
          <div>
            <p className="font-semibold uppercase">Nhà cung cấp</p>
            <p className="text-[10px] text-zinc-400 mt-1">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="h-[50px]" />
        </div>
        <div className="min-h-[120px] flex flex-col justify-between">
          <div>
            <p className="font-semibold uppercase">Người lập phiếu</p>
            <p className="text-[10px] text-zinc-400 mt-1">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold">Aquamarine</p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintablePurchaseInvoice.displayName = "PrintablePurchaseInvoice";
