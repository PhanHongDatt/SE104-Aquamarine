import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDanhSachNhaCungCap } from "@/actions/danh-muc";
import { SupplierClient } from "@/components/nha-cung-cap/supplier-client";

export const metadata = { 
  title: "Nhà cung cấp – Admin | Quản Lý Vàng Bạc Đá Quý" 
};

export default async function AdminNhaCungCapPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "QUAN_LY";

  let data = [];
  try {
    data = await getDanhSachNhaCungCap();
  } catch (e) {
    console.error("Failed to fetch suppliers:", e);
  }

  return (
    <div className="p-6 lg:p-8">
      <SupplierClient initialData={data} isAdmin={isAdmin} />
    </div>
  );
}
