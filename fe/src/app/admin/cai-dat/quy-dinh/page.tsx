import { Settings } from "lucide-react";
import { getSystemSettings } from "@/actions/settings.action";
import { SystemSettingsForm } from "@/components/forms/system-settings-form";

export const metadata = { title: "Thay đổi quy định – Admin | Aquamarine Jewelry & Luxury" };

export default async function AdminQuyDinhPage() {
  const settings = await getSystemSettings();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Thay đổi quy định
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Thiết lập các tham số, chính sách và định mức vận hành cửa hàng</p>
      </div>

      <SystemSettingsForm initialData={settings} />
    </div>
  );
}
