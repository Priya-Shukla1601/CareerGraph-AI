"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { fetchAnalytics, AnalyticsData } from "@/lib/api";
import {
  FileText,
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Brain,
  BarChart2,
  RefreshCw,
} from "lucide-react";
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
} from "recharts";

const COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAnalytics();
    if (result.error || !result.data) {
      setError(result.error ?? "Failed to load database analytics.");
    } else {
      setData(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCandidates = data?.totalCandidates ?? 0;
  const totalResumes = data?.totalResumes ?? 0;
  const activeJobs = data?.activeJobs ?? 0;
  const shortlisted = data?.shortlisted ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Recruitment & AI Matching Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time insights computed directly from uploaded resumes, candidate records, and job requirements
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            label="Total Resumes Uploaded"
            value={totalResumes}
            change="Persistent file storage"
            positive={true}
            icon={FileText}
            color="indigo"
          />
          <KPICard
            label="Active Job Descriptions"
            value={activeJobs}
            change="Screening benchmarks"
            positive={true}
            icon={Briefcase}
            color="violet"
          />
          <KPICard
            label="Total Candidates"
            value={totalCandidates}
            change="Parsed & database-stored"
            positive={true}
            icon={Users}
            color="emerald"
          />
          <KPICard
            label="Shortlisted Candidates"
            value={shortlisted}
            change={totalCandidates > 0 ? `${Math.round((shortlisted / totalCandidates) * 100)}% conversion` : "0% conversion"}
            positive={shortlisted > 0}
            icon={Star}
            color="amber"
          />
        </div>

        {/* Charts Row 1: Matching Score & Top Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                Matching Score Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Composite scores across candidates (Semantic, Skills, Experience, Education)
              </p>
            </div>
            <div style={{ height: 260 }}>
              {data && data.scoreDistribution && data.scoreDistribution.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  {totalCandidates === 0
                    ? "Upload resumes and match them against jobs to see score distributions."
                    : "Match candidates against a job to populate scoring distribution."}
                </div>
              )}
            </div>
          </div>

          {/* Top Skills Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-600" />
                Top Skills in Pool
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Most prevalent skills detected across resumes and jobs
              </p>
            </div>
            <div style={{ height: 260 }}>
              {data && data.skillDemand && data.skillDemand.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.skillDemand.slice(0, 6).map((s) => ({ name: s.skill, value: s.count }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.skillDemand.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No skills detected yet. Upload resumes to extract technical skills.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Experience Distribution & System Processing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experience Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Experience Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Years of experience extracted from candidate histories
              </p>
            </div>
            <div style={{ height: 240 }}>
              {data && data.experienceDistribution ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.experienceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Candidates" />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          {/* Pipeline Activity Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Processing & Activity Stream
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recent system events, resume uploads, and candidate updates
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[240px] overflow-y-auto">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((act, i) => (
                  <div key={i} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{act.name}</p>
                      <p className="text-slate-500 mt-0.5">{act.action}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No system activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
