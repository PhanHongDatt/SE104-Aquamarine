import { UserProfileView } from "@/components/dashboard/user-profile-view";

export const metadata = { title: "Hồ sơ Quản lý – Aquamarine Jewelry" };

export default function AdminTaiKhoanPage() {
  return (
    <div className="p-6 lg:p-8">
      <UserProfileView />
    </div>
  );
}
