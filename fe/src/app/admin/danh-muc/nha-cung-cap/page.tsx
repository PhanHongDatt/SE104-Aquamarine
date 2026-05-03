import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDanhSachNhaCungCap } from "@/actions/danh-muc";
import { SupplierClient } from "@/components/nha-cung-cap/supplier-client";
import type { NhaCungCap } from "@/types/model";

export const metadata = { 
  title: "Nhà cung cấp – Admin | Aquamarine Jewelry & Luxury" 
};

export default async function AdminNhaCungCapPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "QUAN_LY";

  let data: NhaCungCap[] = [];
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
