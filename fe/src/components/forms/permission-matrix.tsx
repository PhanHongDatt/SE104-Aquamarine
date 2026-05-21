"use client";

import { useMemo, useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setBangPhanQuyen } from "@/actions/phan-quyen.action";
import { Button } from "@/components/ui/button";

interface PermissionMatrixProps {
  groups: any[];
  permissions: any[];
  initialPermissions: Record<string, string[]>;
}

export function PermissionMatrix({ groups, permissions, initialPermissions }: PermissionMatrixProps) {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.maNhom ?? "");
  const [checked, setChecked] = useState<Record<string, string[]>>(initialPermissions);
  const [isSaving, setIsSaving] = useState(false);

  const selectedValues = useMemo(() => new Set(checked[selectedGroup] ?? []), [checked, selectedGroup]);

  const togglePermission = (maChucNang: string) => {
    setChecked((current) => {
      const values = new Set(current[selectedGroup] ?? []);
      if (values.has(maChucNang)) {
        values.delete(maChucNang);
      } else {
        values.add(maChucNang);
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
    <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Bảng phân quyền chức năng
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Quyền được áp dụng khi người dùng đăng nhập lại vào hệ thống.
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
              <th className="px-5 py-3 w-24">Cho phép</th>
              <th className="px-5 py-3 w-32">Mã</th>
              <th className="px-5 py-3">Chức năng</th>
              <th className="px-5 py-3">Màn hình/luồng áp dụng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {permissions.map((permission) => (
              <tr key={permission.maChucNang} className="hover:bg-zinc-50">
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selectedValues.has(permission.maChucNang)}
                    onChange={() => togglePermission(permission.maChucNang)}
                    className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-5 py-3 font-mono text-xs text-zinc-500">{permission.maChucNang}</td>
                <td className="px-5 py-3 font-semibold text-zinc-900">{permission.tenChucNang}</td>
                <td className="px-5 py-3 text-zinc-500">{permission.tenManHinhDuocLoad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
