import { UserProfileView } from "@/components/dashboard/user-profile-view";

export const metadata = { title: "Tài khoản cá nhân – Aquamarine Jewelry" };

export default function TaiKhoanPage() {
  return (
    <div className="page-container p-6 lg:p-8">
      <UserProfileView />
    </div>
  );
}
