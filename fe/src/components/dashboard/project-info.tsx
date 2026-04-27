import { BookOpen, Users, GraduationCap, Gem } from "lucide-react";

const members = [
  { name: "Nguyễn Lê Nhật Đăng", id: "23520231" },
  { name: "Phan Hồng Đạt", id: "23520266" },
  { name: "Phạm Anh Quốc", id: "23521307" },
];

export function ProjectInfo() {
  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Gem className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">Thông tin đề tài</h2>
          <p className="text-xs text-gray-400">Môn học: Nhập môn Công nghệ phần mềm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Project Info */}
        <div className="space-y-4">
          <InfoRow
            icon={<BookOpen className="w-4 h-4 text-primary" />}
            label="Tên đề tài"
            value="Quản lý cửa hàng vàng bạc đá quý"
          />
          <InfoRow
            icon={<BookOpen className="w-4 h-4 text-accent" />}
            label="Môn học"
            value="Nhập môn Công nghệ phần mềm"
          />
          <InfoRow
            icon={<GraduationCap className="w-4 h-4 text-soft" />}
            label="Giảng viên hướng dẫn"
            value="TS. Đỗ Thị Thanh Tuyền"
          />
          <InfoRow
            icon={<Users className="w-4 h-4 text-amber-500" />}
            label="Nhóm"
            value="Nhóm 08 — SE104.Q23"
          />
        </div>

        {/* Team Members */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Thành viên nhóm</p>
          <div className="space-y-2.5">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-warm/60 border border-warm-dark/20 hover:bg-warm transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">MSSV: {m.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-soft/20">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
