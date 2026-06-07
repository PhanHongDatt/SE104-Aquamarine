import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTransition } from "@/components/providers/page-transition";
import { AlertCircle, Clock, Package, Wrench, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getCurrentPermissions } from "@/lib/permissions";

export const metadata = {
  title: "Dashboard Nhân viên – Aquamarine Jewelry & Luxury",
};

export default async function StaffDashboardPage() {
  const [session, currentPermissions] = await Promise.all([
    getServerSession(authOptions),
    getCurrentPermissions(),
  ]);

  const [unfinishedServices, lowStockProducts, lowStockCount] = await Promise.all([
    prisma.phieuDichVu.findMany({
      where: { tinhTrang: "ChuaHoanThanh" },
      orderBy: { ngayLap: 'desc' },
      take: 5,
    }),
    prisma.$queryRaw<Array<{
      maSP: string;
      tenSP: string;
      tonKho: number;
      tonToiThieu: number;
      tenDVT: string;
    }>>`
      SELECT sp."maSP", sp."tenSP", sp."tonKho", sp."tonToiThieu", dvt."tenDVT"
      FROM "SanPham" sp
      INNER JOIN "DonViTinh" dvt ON dvt."maDVT" = sp."maDVT"
      WHERE sp."deletedAt" IS NULL AND sp."tonKho" < sp."tonToiThieu"
      ORDER BY sp."tonKho" ASC
      LIMIT 5
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "SanPham" sp
      WHERE sp."deletedAt" IS NULL AND sp."tonKho" < sp."tonToiThieu"
    `,
  ]);
  const lowStockTotal = Number(lowStockCount[0]?.count ?? 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const firstName = session?.user?.name?.split(" ").pop() ?? "";
  const role = (session?.user as any)?.role;
  const permissions = currentPermissions;
  const can = (maChucNang: string, hanhDong = "XEM") =>
    role === "QUAN_LY" ||
    permissions.includes(`${maChucNang}:${hanhDong}`) ||
    permissions.includes(maChucNang);
  const canViewServices = can("DV_TRA", "XEM");
  const canCreateSale = can("GD_BAN", "THEM");
  const canViewSale = can("GD_BAN", "XEM");
  const canViewPurchase = can("GD_MUA", "XEM");
  const canCreateService = can("DV_LAP", "THEM");
  const canViewProducts = can("DM_SP", "XEM");
  const canViewInventory = can("BC_TON", "XEM");
  const quickLinks = [
    canViewSale && { href: "/nhan-vien/giao-dich/ban-hang", category: "Bán lẻ", label: "Phiếu bán hàng" },
    canViewPurchase && { href: "/nhan-vien/giao-dich/mua-hang", category: "Nhập kho", label: "Phiếu mua hàng" },
    canCreateService && { href: "/nhan-vien/dich-vu/lap-phieu", category: "Dịch vụ", label: "Lập phiếu gia công" },
    canViewProducts && { href: "/nhan-vien/danh-muc/san-pham", category: "Tra cứu", label: "Danh mục sản phẩm" },
  ].filter(Boolean) as Array<{ href: string; category: string; label: string }>;

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6">
        
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-sm text-zinc-500 mt-1 italic">
              Cửa hàng Aquamarine Jewelry & Luxury chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>
          <div className="flex items-center gap-3">
             {canViewServices && (
               <Link href="/nhan-vien/dich-vu/tra-cuu" className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors flex items-center gap-2">
                 <Search className="w-4 h-4" /> Tra cứu dịch vụ
               </Link>
             )}
             {canCreateSale && (
               <Link href="/nhan-vien/giao-dich/ban-hang/tao-moi" className="px-4 py-2 bg-primary text-sm font-medium text-white rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                 <PlusCircle className="w-4 h-4" /> Lập phiếu bán
               </Link>
             )}
          </div>
        </div>

        {canViewInventory && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
              <p className="text-sm text-zinc-500 font-medium">Cần nhập thêm</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold text-zinc-900">{lowStockTotal}</p>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs text-red-500 font-medium mt-1">Sản phẩm dưới mức tối thiểu</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Unfinished Services */}
          {canViewServices && (
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
          )}

          {/* Section 2: Low Stock Alerts */}
          {canViewInventory && (
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
                          <p className="text-[11px] text-zinc-500">Mã: {p.maSP} - DVT: {p.tenDVT}</p>
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
          )}
        </div>

        {/* Quick Links Group */}
        {quickLinks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{item.category}</p>
                <p className="text-sm font-bold text-zinc-900">{item.label}</p>
              </Link>
            ))}
          </div>
        )}
        
      </div>
    </PageTransition>
  );
}
