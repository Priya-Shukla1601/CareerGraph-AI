"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { AnalyticsData } from "@/lib/api";

const COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#14b8a6"];

const CHART_STYLE = {
  contentStyle: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "12px",
  },
};

function ChartCard({
  title,
  subtitle,
  children,
  height = 260,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

interface AnalyticsChartsProps {
  analytics?: AnalyticsData | null;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const totalCandidates = analytics?.totalCandidates ?? 0;
  const activeJobs = analytics?.activeJobs ?? 0;
  const shortlisted = analytics?.shortlisted ?? 0;
  const scoreDistribution = analytics?.scoreDistribution ?? [];
  const skillDemand = analytics?.skillDemand ?? [];
  const experienceDistribution = analytics?.experienceDistribution ?? [];
  const jobCandidates = analytics?.jobCandidates ?? [];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: totalCandidates },
          { label: "Active Jobs", value: activeJobs },
          { label: "Shortlisted", value: shortlisted },
          {
            label: "Shortlist Rate",
            value: totalCandidates > 0 ? `${Math.round((shortlisted / totalCandidates) * 100)}%` : "0%",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Skill demand */}
      <ChartCard title="Top Technical Skills" subtitle="Skills detected across resumes and jobs" height={300}>
        {skillDemand.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillDemand.slice(0, 8)}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No technical skills detected yet.
          </div>
        )}
      </ChartCard>

      {/* Experience distribution + Job-wise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Experience Distribution" subtitle="Candidate count by experience range">
          {experienceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_STYLE} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No candidate experience records.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Job-wise Candidate Distribution" subtitle="Candidates evaluated per job role">
          {jobCandidates.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobCandidates}
                  dataKey="count"
                  nameKey="job"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {jobCandidates.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...CHART_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Create jobs and match candidates to see job distributions.
            </div>
          )}
        </ChartCard>
      </div>

      {/* Score distribution area chart */}
      <ChartCard title="Matching Score Distribution" subtitle="Candidate count by matching score bracket" height={280}>
        {scoreDistribution.some((d) => d.count > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#scoreGrad)"
                name="Candidates"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Match candidates against a job to visualize score distributions.
          </div>
        )}
      </ChartCard>
    </div>
  );
}
