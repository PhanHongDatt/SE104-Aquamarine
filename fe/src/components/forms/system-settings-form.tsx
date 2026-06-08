"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Settings, ShieldAlert, Info, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { systemSettingsSchema, type SystemSettingsFormValues } from "@/schemas/system-settings.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSystemSettings } from "@/actions/settings.action";
import { usePermissions } from "@/hooks/use-permissions";

interface SystemSettingsFormProps {
  initialData: any;
}

export function SystemSettingsForm({ initialData }: SystemSettingsFormProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("HT_QDI", "SUA");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const clockParts = useMemo(() => {
    if (!now) {
      return {
        time: "--:--:--",
        date: "Đang đồng bộ thời gian",
        zone: "Asia/Bangkok (UTC+7)",
      };
    }

    return {
      time: now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
      }),
      date: now.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      }),
      zone: "Asia/Bangkok (UTC+7)",
    };
  }, [now]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      phanTramLoiNhuanToiThieu: Number(initialData?.phanTramLoiNhuanToiThieu || 0),
      soLuongTonKhoToiThieu: Number(initialData?.soLuongTonKhoToiThieu || 0),
      tiLeTraTruocToiThieu: Number(initialData?.tiLeTraTruocToiThieu || 50),
    },
  });

  const onSubmit = async (data: SystemSettingsFormValues) => {
    try {
      const res = await updateSystemSettings(data);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối hệ thống");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Thông số quy định</h2>
              <p className="text-xs text-zinc-500">Cấu hình các tham số vận hành nghiệp vụ toàn hệ thống</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* QĐ2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">QĐ2</span>
                <h3 className="font-bold text-zinc-800">Phần trăm lợi nhuận tối thiểu</h3>
              </div>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Input
                    label="Phần trăm lợi nhuận tối thiểu (%)"
                    type="number"
                    step="0.01"
                    placeholder="VD: 5"
                    required
                    error={errors.phanTramLoiNhuanToiThieu?.message}
                    {...register("phanTramLoiNhuanToiThieu")}
                  />
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    * Là mức sàn khi thêm/sửa loại sản phẩm. Quy định mới áp dụng cho thao tác sau thời điểm cập nhật, không tự sửa dữ liệu cũ.
                  </p>
                </div>
              </div>
            </div>

            {/* QĐ3 */}
            <div className="space-y-4 border-t border-zinc-50 pt-8">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-black">QĐ3</span>
                <h3 className="font-bold text-zinc-800">Mức tồn kho tối thiểu</h3>
              </div>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Input
                    label="Số lượng tồn kho tối thiểu (mặc định)"
                    type="number"
                    placeholder="VD: 5"
                    required
                    error={errors.soLuongTonKhoToiThieu?.message}
                    {...register("soLuongTonKhoToiThieu")}
                  />
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    * Đây là ngưỡng chung toàn hệ thống dùng để đối chiếu trong báo cáo tồn kho. Sản phẩm không còn lưu mức tồn tối thiểu riêng để tránh mâu thuẫn dữ liệu.
                  </p>
                </div>
              </div>
            </div>

            {/* QĐ6 */}
            <div className="space-y-4 border-t border-zinc-50 pt-8">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-black">QĐ6</span>
                <h3 className="font-bold text-zinc-800">% Trả trước tối thiểu khi lập phiếu dịch vụ</h3>
              </div>
              <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Input
                    label="Phần trăm trả trước tối thiểu (%)"
                    type="number"
                    step="0.01"
                    placeholder="VD: 50"
                    required
                    error={errors.tiLeTraTruocToiThieu?.message}
                    {...register("tiLeTraTruocToiThieu")}
                  />
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    * Quy định mức tiền cọc tối thiểu khách hàng phải đóng khi lập phiếu dịch vụ gia công/kiểm định.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
            {canUpdate && (
              <Button type="submit" loading={isSubmitting} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi quy định
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Security Info Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-primary">
            <Clock3 className="w-6 h-6" />
            <h3 className="font-black uppercase tracking-tight text-sm">Đồng hồ hệ thống</h3>
          </div>
          <div>
            <p className="text-4xl font-black text-zinc-900 font-montserrat tracking-tight">{clockParts.time}</p>
            <p className="text-xs text-zinc-500 mt-1 capitalize">{clockParts.date}</p>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Múi giờ vận hành: <strong className="text-zinc-600">{clockParts.zone}</strong>. Ngày lập phiếu và báo cáo dùng cùng mốc ngày nghiệp vụ này.
          </p>
        </div>

        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-black uppercase tracking-tight text-sm">Bảo mật quy định</h3>
          </div>
          <div className="space-y-3 text-xs text-amber-900/80 leading-relaxed font-medium">
            <p>
              Việc thay đổi các tham số này sẽ ảnh hưởng trực tiếp đến <strong>logic tính toán tài chính</strong> và <strong>quy trình nghiệp vụ</strong> của toàn hệ thống ngay sau khi lưu.
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li>Chỉ tài khoản cấp cao nhất mới có quyền truy cập.</li>
              <li>Mọi thay đổi đều được ghi nhận lịch sử (Log).</li>
              <li>Quy định mới sẽ được áp dụng cho các phiếu lập sau thời điểm này.</li>
            </ul>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-zinc-400" />
            </div>
            <h3 className="font-bold text-sm">Ghi chú vận hành</h3>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Hệ thống tự động đồng bộ hóa các quy định này với bộ phận Bán hàng và Kho. Khi lưu thành công, nhân viên sẽ nhận thấy sự thay đổi ở mức trả trước tối thiểu và các cảnh báo tồn kho tương ứng.
          </p>
        </div>
      </div>
    </div>
  );
}
