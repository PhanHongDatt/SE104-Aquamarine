import { getDanhSachNhaCungCap } from "@/actions/danh-muc";
import { SupplierClient } from "@/components/nha-cung-cap/supplier-client";
import type { NhaCungCap } from "@/types/model";

export const metadata = {
  title: "Nhà Cung Cấp – Aquamarine Jewelry & Luxury",
};

export default async function Page() {
  let data: NhaCungCap[] = [];
  try {
    data = await getDanhSachNhaCungCap();
  } catch (e) {
    console.error("Failed to fetch suppliers:", e);
  }

  return (
    <div className="p-6 lg:p-8">
      <SupplierClient initialData={data} />
    </div>
  );
}
export const dynamic = "force-dynamic";
