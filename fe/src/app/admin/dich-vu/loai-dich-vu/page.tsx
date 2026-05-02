import { Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ServiceTypeList } from "@/components/forms/service-type-list";

export const metadata = { title: "Danh mục loại dịch vụ – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminLoaiDichVuPage() {
  const data = await prisma.loaiDichVu.findMany({
    orderBy: { maDV: 'asc' }
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-primary" />
          Danh mục loại dịch vụ
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Quản lý các loại dịch vụ gia công và kiểm định</p>
      </div>

      <ServiceTypeList initialData={JSON.parse(JSON.stringify(data))} />
    </div>
  );
}
