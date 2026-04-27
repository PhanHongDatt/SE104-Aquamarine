import { cn } from "@/lib/utils";

const transactions = [
  { id: "PB-0012", type: "Bán hàng", date: "Hôm nay, 10:24", amount: "+ 5.2M ₫", status: "success" },
  { id: "PM-0045", type: "Mua hàng", date: "Hôm qua, 15:30", amount: "- 1.5M ₫", status: "success" },
  { id: "PD-0089", type: "Dịch vụ", date: "24/04/2026", amount: "Đang chờ", status: "pending" },
  { id: "PB-0011", type: "Bán hàng", date: "24/04/2026", amount: "+ 12.0M ₫", status: "success" },
  { id: "PM-0044", type: "Mua hàng", date: "23/04/2026", amount: "- 2.1M ₫", status: "canceled" },
];

export function RecentActivities() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Giao dịch gần đây</h3>
          <p className="text-xs text-zinc-500 mt-0.5">5 giao dịch mới nhất toàn hệ thống</p>
        </div>
        <button className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
          Xem tất cả
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-zinc-500 uppercase tracking-wider bg-zinc-50/50">
            <tr>
              <th className="px-3 py-2.5 font-medium rounded-l-lg">Mã Phiếu</th>
              <th className="px-3 py-2.5 font-medium">Loại</th>
              <th className="px-3 py-2.5 font-medium">Thời gian</th>
              <th className="px-3 py-2.5 font-medium text-right rounded-r-lg">Trị giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors group">
                <td className="px-3 py-3">
                  <span className="font-medium text-zinc-900">{tx.id}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-zinc-600">{tx.type}</span>
                </td>
                <td className="px-3 py-3 text-zinc-500 text-xs">
                  {tx.date}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "font-semibold",
                        tx.status === "pending" ? "text-amber-600" :
                        tx.status === "canceled" ? "text-zinc-400 line-through decoration-zinc-300" :
                        tx.amount.startsWith("+") ? "text-green-600" : "text-zinc-900"
                      )}
                    >
                      {tx.amount}
                    </span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block",
                      tx.status === "success" && "bg-green-100/50 text-green-700",
                      tx.status === "pending" && "bg-amber-100/50 text-amber-700",
                      tx.status === "canceled" && "bg-zinc-100 text-zinc-500"
                    )}>
                      {tx.status === "success" ? "Hoàn tất" : tx.status === "pending" ? "Chờ xử lý" : "Đã hủy"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
