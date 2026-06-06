"use client";

import { useMemo, useState } from "react";
import { Save, ShieldCheck, AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { setBangPhanQuyen } from "@/actions/phan-quyen.action";
import { Button } from "@/components/ui/button";

interface PermissionMatrixProps {
  groups: any[];
  permissions: any[]; // ChucNang[]
  initialPermissions: Record<string, string[]>; // { "QUANLY": ["DM_SP:XEM", "DM_SP:THEM", ...] }
}

// Hành động hợp lệ cho từng chức năng
const ACTION_MAP: Record<string, string[]> = {
  DM_DVT: ["XEM", "THEM", "SUA", "XOA"],
  DM_LSP: ["XEM", "THEM", "SUA", "XOA"],
  DM_SP:  ["XEM", "THEM", "SUA", "XOA"],
  DM_KH:  ["XEM", "THEM", "SUA", "XOA"],
  DM_NCC: ["XEM", "THEM", "SUA", "XOA"],
  GD_BAN: ["XEM", "THEM"],
  GD_MUA: ["XEM", "THEM"],
  DV_LAP: ["XEM", "THEM"],
  DV_TRA: ["XEM", "SUA"],
  BC_TON: ["XEM"],
  BC_DTH: ["XEM"],
  HT_USR: ["XEM", "THEM", "SUA", "XOA"],
  HT_PHQ: ["XEM", "SUA"],
  HT_QDI: ["XEM", "SUA"],
  HT_BAK: ["XEM", "THEM"],
};

const ACTION_LABELS: Record<string, string> = {
  XEM: "Xem",
  THEM: "Thêm",
  SUA: "Sửa",
  XOA: "Xóa",
};

const ACTION_ORDER = ["XEM", "THEM", "SUA", "XOA"];

// Map đường dẫn admin → đường dẫn nhân viên
const STAFF_ROUTE_MAP: Record<string, string> = {
  "/admin/danh-muc/san-pham": "/nhan-vien/danh-muc/san-pham",
  "/admin/danh-muc/khach-hang": "/nhan-vien/danh-muc/khach-hang",
  "/admin/giao-dich/ban-hang": "/nhan-vien/giao-dich/ban-hang",
  "/admin/dich-vu/lap-phieu": "/nhan-vien/dich-vu/lap-phieu",
  "/admin/dich-vu/tra-cuu": "/nhan-vien/dich-vu/tra-cuu",
  "/admin/bao-cao/ton-kho": "/nhan-vien/bao-cao/ton-kho",
};

function getDisplayRoute(tenManHinhDuocLoad: string, isStaffGroup: boolean): string {
  if (!isStaffGroup) return tenManHinhDuocLoad;
  return STAFF_ROUTE_MAP[tenManHinhDuocLoad] ?? "—";
}

export function PermissionMatrix({ groups, permissions, initialPermissions }: PermissionMatrixProps) {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.maNhom ?? "");
  const [checked, setChecked] = useState<Record<string, string[]>>(initialPermissions);
  const [isSaving, setIsSaving] = useState(false);
  const [showReLoginNotice, setShowReLoginNotice] = useState(false);

  const selectedValues = useMemo(() => new Set(checked[selectedGroup] ?? []), [checked, selectedGroup]);
  const isStaffGroup = useMemo(() => {
    const group = groups.find((g: any) => g.maNhom === selectedGroup);
    return group?.tenNhom === "NHAN_VIEN";
  }, [selectedGroup, groups]);

  const togglePermission = (key: string) => {
    setChecked((current) => {
      const values = new Set(current[selectedGroup] ?? []);
      if (values.has(key)) {
        values.delete(key);
      } else {
        values.add(key);
      }
      return { ...current, [selectedGroup]: Array.from(values) };
    });
  };

  // Toggle tất cả hành động của một chức năng
  const toggleAllActions = (maChucNang: string) => {
    const validActions = ACTION_MAP[maChucNang] || ["XEM"];
    const allKeys = validActions.map((a) => `${maChucNang}:${a}`);
    const allChecked = allKeys.every((k) => selectedValues.has(k));

    setChecked((current) => {
      const values = new Set(current[selectedGroup] ?? []);
      if (allChecked) {
        allKeys.forEach((k) => values.delete(k));
      } else {
        allKeys.forEach((k) => values.add(k));
      }
      return { ...current, [selectedGroup]: Array.from(values) };
    });
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setIsSaving(true);
    const result = await setBangPhanQuyen(selectedGroup, checked[selectedGroup] ?? []);
    setIsSaving(false);

    if (result.success) {
      toast.success(result.message);
      if (isStaffGroup) {
        setShowReLoginNotice(true);
      }
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  if (groups.length === 0 || permissions.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Chưa có dữ liệu nhóm quyền hoặc chức năng. Vui lòng chạy seed dữ liệu trước khi phân quyền.
      </div>
    );
  }

  return (
    <>
    <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Bảng phân quyền chức năng
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Quyền được áp dụng khi người dùng <strong>đăng nhập lại</strong> hoặc <strong>reload trang</strong>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
          >
            {groups.map((group) => (
              <option key={group.maNhom} value={group.maNhom}>
                {group.tenNhom === "QUAN_LY" ? "Quản lý" : "Nhân viên"} ({group.maNhom})
              </option>
            ))}
          </select>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Đang lưu..." : "Lưu phân quyền"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-zinc-600">
              <th className="px-4 py-3 w-10 text-center">STT</th>
              <th className="px-4 py-3 w-24">Mã</th>
              <th className="px-4 py-3">Chức năng</th>
              <th className="px-4 py-3 text-center">Xem</th>
              <th className="px-4 py-3 text-center">Thêm</th>
              <th className="px-4 py-3 text-center">Sửa</th>
              <th className="px-4 py-3 text-center">Xóa</th>
              <th className="px-4 py-3">Màn hình/luồng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {permissions.map((permission, index) => {
              const validActions = ACTION_MAP[permission.maChucNang] || ["XEM"];
              const displayRoute = getDisplayRoute(permission.tenManHinhDuocLoad, isStaffGroup);
              const isAccessible = displayRoute !== "—";

              return (
                <tr key={permission.maChucNang} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 text-center text-zinc-400 font-mono text-xs">{index + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{permission.maChucNang}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">{permission.tenChucNang}</td>

                  {/* 4 cột hành động */}
                  {ACTION_ORDER.map((action) => {
                    const key = `${permission.maChucNang}:${action}`;
                    const isValid = validActions.includes(action);
                    return (
                      <td key={action} className="px-4 py-3 text-center">
                        {isValid ? (
                          <input
                            type="checkbox"
                            checked={selectedValues.has(key)}
                            onChange={() => togglePermission(key)}
                            className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        ) : (
                          <span className="text-zinc-200">—</span>
                        )}
                      </td>
                    );
                  })}

                  <td className={`px-4 py-3 text-xs ${isAccessible ? "text-zinc-500" : "text-zinc-300 italic"}`}>
                    {displayRoute}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>

    {showReLoginNotice && (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">Đã lưu phân quyền</p>
            <p className="text-sm text-amber-700 mt-1">
              Quyền đã được cập nhật vào cơ sở dữ liệu. Nhân viên cần <strong>reload trang</strong> hoặc <strong>đăng nhập lại</strong> để áp dụng quyền mới.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-xl gap-2 border-amber-300 text-amber-800 hover:bg-amber-100 flex-shrink-0"
          onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất ngay
        </Button>
      </div>
    )}
  </>
  );
}
