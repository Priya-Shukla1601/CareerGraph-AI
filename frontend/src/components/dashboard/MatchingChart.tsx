"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MatchingChartProps {
  data?: { range: string; count: number }[];
}

export function MatchingChart({ data }: MatchingChartProps) {
  const chartData = data && data.length > 0 ? data : [
    { range: "0–20", count: 0 },
    { range: "20–40", count: 0 },
    { range: "40–60", count: 0 },
    { range: "60–70", count: 0 },
    { range: "70–80", count: 0 },
    { range: "80–90", count: 0 },
    { range: "90–100", count: 0 },
  ];

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">
          Matching Score Distribution
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Candidate count by matching score range
        </p>
      </div>
      <div className="p-4" style={{ height: 240 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center px-4">
            Upload resumes and match candidates against a job to see score distributions.
          </div>
        )}
      </div>
    </div>
  );
}
