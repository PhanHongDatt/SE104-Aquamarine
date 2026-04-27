"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const rawData = [
  { name: "T2", doanhThu: 12 },
  { name: "T3", doanhThu: 18 },
  { name: "T4", doanhThu: 15 },
  { name: "T5", doanhThu: 25 },
  { name: "T6", doanhThu: 22 },
  { name: "T7", doanhThu: 35 },
  { name: "CN", doanhThu: 42 },
];

export function OverviewChart() {
  const data = useMemo(() => rawData, []);

  return (
    <div className="h-full w-full min-h-[300px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">Biểu đồ Doanh Thu</h3>
        <p className="text-xs text-zinc-500 mt-0.5">7 ngày gần nhất (Triệu VNĐ)</p>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#170C79" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#170C79" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#A1A1AA" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#A1A1AA" }} 
              tickFormatter={(value) => `${value}M`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl p-3">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                        {payload[0].payload.name}
                      </p>
                      <p className="text-lg font-bold text-zinc-900">
                        {payload[0].value} Triệu
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: "#E4E4E7", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="doanhThu"
              stroke="#170C79"
              strokeWidth={2}
              fill="url(#colorDoanhThu)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
