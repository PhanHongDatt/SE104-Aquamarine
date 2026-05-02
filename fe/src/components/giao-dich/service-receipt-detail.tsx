"use client";

import { useState, useRef } from "react";
import { 
  FileText, Printer, ChevronLeft, Calendar, 
  User, Phone, Clock, CheckCircle2, AlertCircle, Save, Download
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrintableServiceInvoice } from "./printable-service-invoice";
import { updateTinhTrangDichVu } from "@/actions/service.action";

interface ServiceReceiptDetailProps {
  phieu: any;
  isAdmin?: boolean;
}

export function ServiceReceiptDetail({ phieu, isAdmin = false }: ServiceReceiptDetailProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    if (!pri) return;

    // Get all styles from the current document to apply to the iframe
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    pri.document.open();
    pri.document.write(`
      <html>
        <head>
          <title>PhieuDichVu_${phieu.soPhieu}</title>
          ${styles}
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
              .print-container { width: 100% !important; }
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printRef.current.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.parent.document.body.removeChild(window.frameElement);
                }, 100);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    pri.document.close();
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [details, setDetails] = useState(phieu.chiTietDichVu.map((ct: any) => ({
    stt: ct.stt,
    ketQua: ct.ketQua || "",
    soChungThu: ct.soChungThu || "",
    ngayGiao: ct.ngayGiao ? new Date(ct.ngayGiao).toISOString().split('T')[0] : "",
    nhomDV: ct.loaiDichVu?.nhomDV
  })));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      const res = await updateTinhTrangDichVu(phieu.soPhieu, details);
      if (res.success) {
        toast.success("Cập nhật trạng thái thành công");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi cập nhật");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Printable component - Positioned off-screen for accessibility */}
      <div className="absolute -top-[9999px] -left-[9999px]">
        <div ref={printRef}>
          <PrintableServiceInvoice phieu={phieu} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> In phiếu
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            className="gap-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none shadow-none"
          >
            <Download className="w-4 h-4" /> Tải PDF
          </Button>
          {phieu.tinhTrang !== "HoanThanh" && (
            <Button onClick={handleUpdateStatus} loading={isUpdating} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" /> Cập nhật & Giao hàng
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Phieu Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Thông tin phiếu</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                phieu.tinhTrang === "HoanThanh" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {phieu.tinhTrang === "HoanThanh" ? "Đã hoàn thành" : "Đang xử lý"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Số phiếu:</span>
                <span className="font-mono text-zinc-900 ml-auto">{phieu.soPhieu}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Ngày lập:</span>
                <span className="text-zinc-900 ml-auto">{new Date(phieu.ngayLap).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <User className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Khách hàng:</span>
                <span className="text-zinc-900 ml-auto font-bold">{phieu.tenKhachHang}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span className="font-medium">Số điện thoại:</span>
                <span className="text-zinc-900 ml-auto">{phieu.soDienThoai || "---"}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white rounded-3xl p-6 space-y-4 shadow-lg shadow-primary/20">
            <h2 className="text-sm font-medium opacity-80 uppercase tracking-wider">Tổng cộng tài chính</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center opacity-90">
                <span>Tổng tiền dịch vụ:</span>
                <span className="font-bold">{formatCurrency(Number(phieu.tongTien))}</span>
              </div>
              <div className="flex justify-between items-center text-green-300">
                <span>Đã trả trước:</span>
                <span className="font-bold">-{formatCurrency(Number(phieu.tongTraTruoc))}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold">Còn lại:</span>
                <span className="text-2xl font-black font-montserrat tracking-tight">
                  {formatCurrency(Number(phieu.tongConLai))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Items & Status Update */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Chi tiết dịch vụ & Giao hàng</h2>
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>

            <div className="divide-y divide-zinc-100">
              {phieu.chiTietDichVu.map((item: any, idx: number) => (
                <div key={item.stt} className="p-6 space-y-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400">#{item.stt}</span>
                        <h3 className="font-bold text-zinc-900">{item.loaiDichVu?.tenDV}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.loaiDichVu?.nhomDV === 'GiaCong' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {item.loaiDichVu?.nhomDV === 'GiaCong' ? 'Gia công' : 'Kiểm định'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Số lượng: {item.soLuong} | Đơn giá DV: {formatCurrency(Number(item.donGiaDV))} | Phát sinh: {formatCurrency(Number(item.chiPhiPhatSinh))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-900">{formatCurrency(Number(item.thanhTien))}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">Nợ: {formatCurrency(Number(item.conLai))}</p>
                    </div>
                  </div>

                  {/* Status update fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Ngày giao thực tế</label>
                      <Input 
                        type="date"
                        disabled={phieu.tinhTrang === "HoanThanh"}
                        value={details[idx].ngayGiao}
                        onChange={(e) => {
                          const newDetails = [...details];
                          newDetails[idx].ngayGiao = e.target.value;
                          setDetails(newDetails);
                        }}
                        className="h-9 text-xs"
                      />
                    </div>

                    {item.loaiDichVu?.nhomDV === 'KiemDinh' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Kết quả giám định</label>
                          <select
                            disabled={phieu.tinhTrang === "HoanThanh"}
                            value={details[idx].ketQua}
                            onChange={(e) => {
                              const newDetails = [...details];
                              newDetails[idx].ketQua = e.target.value;
                              setDetails(newDetails);
                            }}
                            className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">-- Chọn kết quả --</option>
                            <option value="Đạt chuẩn">Đạt chuẩn</option>
                            <option value="Không đạt chuẩn">Không đạt chuẩn</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Số chứng thư</label>
                          <Input 
                            placeholder="Nhập số CT"
                            disabled={phieu.tinhTrang === "HoanThanh"}
                            value={details[idx].soChungThu}
                            onChange={(e) => {
                              const newDetails = [...details];
                              newDetails[idx].soChungThu = e.target.value;
                              setDetails(newDetails);
                            }}
                            className="h-9 text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Lưu ý khi giao hàng</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Nhân viên cần kiểm tra kỹ lại tình trạng sản phẩm và ghi nhận kết quả giám định (đối với nhóm Kiểm định) trước khi bấm hoàn thành phiếu. Khi bấm <strong>"Cập nhật & Giao hàng"</strong>, trạng thái phiếu sẽ chuyển sang <strong>Đã hoàn thành</strong> và không thể chỉnh sửa thêm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
