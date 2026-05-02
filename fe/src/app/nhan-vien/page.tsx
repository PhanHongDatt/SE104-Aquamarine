import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTransition } from "@/components/providers/page-transition";
import { AlertCircle, Clock, Package, Wrench, Search, PlusCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Nhân viên – Aquamarine Jewelry & Luxury",
};

export default async function StaffDashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch Unfinished Service Receipts
  const unfinishedServices = await prisma.phieuDichVu.findMany({
    where: { tinhTrang: "ChuaHoanThanh" },
    orderBy: { ngayLap: 'desc' },
    take: 5,
  });

  // Fetch Low Stock Products
  const lowStockProducts = await prisma.sanPham.findMany({
    where: {
      tonKho: { lte: prisma.sanPham.fields.tonToiThieu as any }
    },
    include: { donViTinh: true },
    orderBy: { tonKho: 'asc' },
    take: 5,
  }).catch(() => []); // Fallback

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const firstName = session?.user?.name?.split(" ").pop() ?? "";

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6">
        
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-zinc-500 mt-1 italic">
              Cửa hàng Aquamarine Jewelry & Luxury chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/nhan-vien/dich-vu/tra-cuu" className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors flex items-center gap-2">
               <Search className="w-4 h-4" /> Tra cứu dịch vụ
             </Link>
             <Link href="/nhan-vien/giao-dich/ban-hang/tao-moi" className="px-4 py-2 bg-primary text-sm font-medium text-white rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
               <PlusCircle className="w-4 h-4" /> Lập phiếu bán
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Unfinished Services */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                <Clock className="w-4 h-4 text-amber-500" />
                Phiếu dịch vụ chưa hoàn thành
              </h2>
              <Link href="/nhan-vien/dich-vu/tra-cuu" className="text-[10px] font-bold text-primary hover:underline uppercase">Xem tất cả</Link>
            </div>
            <div className="flex-1">
              {unfinishedServices.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 italic text-sm">Hiện không có phiếu chờ xử lý.</div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {unfinishedServices.map((sv) => (
                    <div key={sv.soPhieu} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{sv.soPhieu}</p>
                          <p className="text-[11px] text-zinc-500">{sv.tenKhachHang} - {new Date(sv.ngayLap).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-zinc-900">{Number(sv.tongConLai).toLocaleString("vi-VN")} đ</p>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter bg-amber-50 px-1.5 py-0.5 rounded mt-1">Chưa xong</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Cảnh báo tồn kho thấp
              </h2>
              <Link href="/nhan-vien/bao-cao/ton-kho" className="text-[10px] font-bold text-primary hover:underline uppercase">Chi tiết kho</Link>
            </div>
            <div className="flex-1">
              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 italic text-sm">Tất cả sản phẩm đều đủ hàng.</div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {lowStockProducts.map((p) => (
                    <div key={p.maSP} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{p.tenSP}</p>
                          <p className="text-[11px] text-zinc-500">Mã: {p.maSP} - DVT: {p.donViTinh?.tenDVT}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-600">{p.tonKho}</p>
                        <p className="text-[10px] text-zinc-400 italic">Mức tối thiểu: {p.tonToiThieu}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Group */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/nhan-vien/giao-dich/ban-hang" className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Bán lẻ</p>
            <p className="text-sm font-bold text-zinc-900">Phiếu bán hàng</p>
          </Link>
          <Link href="/nhan-vien/giao-dich/mua-hang" className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Nhập kho</p>
            <p className="text-sm font-bold text-zinc-900">Phiếu mua hàng</p>
          </Link>
          <Link href="/nhan-vien/dich-vu/lap-phieu" className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Dịch vụ</p>
            <p className="text-sm font-bold text-zinc-900">Lập phiếu gia công</p>
          </Link>
          <Link href="/nhan-vien/danh-muc/san-pham" className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Tra cứu</p>
            <p className="text-sm font-bold text-zinc-900">Danh mục sản phẩm</p>
          </Link>
        </div>
        
      </div>
    </PageTransition>
  );
}
