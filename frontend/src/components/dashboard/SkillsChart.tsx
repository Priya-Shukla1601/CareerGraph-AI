"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

interface SkillsChartProps {
  data?: { skill: string; count: number }[];
}

export function SkillsChart({ data }: SkillsChartProps) {
  const chartData = (data || []).slice(0, 5).map((s) => ({
    name: s.skill,
    value: s.count,
  }));

  const hasData = chartData.length > 0 && chartData.some((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">
          Top Skills Distribution
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Most prevalent technical skills in database</p>
      </div>
      <div className="p-4" style={{ height: 240 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center px-4">
            No technical skills detected yet. Upload resumes to populate skill analytics.
          </div>
        )}
      </div>
    </div>
  );
}
