import { Settings } from "lucide-react";

export const metadata = { title: "Cài Đặt Quy Định – Quản Lý Vàng Bạc Đá Quý" };

export default function CaiDatPage() {
  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Cài Đặt Quy Định Hệ Thống
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Thiết lập các tham số quy định nghiệp vụ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "% Lợi nhuận tối thiểu", value: "5%", desc: "Tỉ lệ lợi nhuận tối thiểu cho mỗi sản phẩm" },
          { label: "Số lượng tồn kho tối thiểu", value: "1", desc: "Ngưỡng cảnh báo tồn kho thấp" },
          { label: "% Trả trước tối thiểu", value: "50%", desc: "Tỉ lệ đặt cọc tối thiểu cho dịch vụ" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-primary">{item.value}</p>
            <p className="text-xs text-zinc-400 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-12 text-center text-zinc-400">
        <Settings className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
        <p className="font-medium">Chức năng chỉnh sửa đang phát triển</p>
      </div>
    </div>
  );
}
