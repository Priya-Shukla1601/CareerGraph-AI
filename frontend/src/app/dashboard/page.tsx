"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MatchingChart } from "@/components/dashboard/MatchingChart";
import { SkillsChart } from "@/components/dashboard/SkillsChart";
import { FileText, Briefcase, Users, Star, RefreshCw } from "lucide-react";
import { fetchAnalytics, fetchJobs, AnalyticsData } from "@/lib/api";
import { Job } from "@/types";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    const [analyticsRes, jobsRes] = await Promise.all([
      fetchAnalytics(),
      fetchJobs(),
    ]);

    if (analyticsRes.data) {
      setAnalytics(analyticsRes.data);
    }
    if (jobsRes.data) {
      setJobs(jobsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalResumes = analytics?.totalResumes ?? 0;
  const activeJobs = analytics?.activeJobs ?? jobs.filter((j) => j.status === "active").length;
  const totalCandidates = analytics?.totalCandidates ?? 0;
  const shortlisted = analytics?.shortlisted ?? 0;

  const KPIS = [
    {
      label: "Total Resumes",
      value: totalResumes,
      change: "Uploaded to database",
      positive: true,
      icon: FileText,
      color: "indigo" as const,
    },
    {
      label: "Active Job Descriptions",
      value: activeJobs,
      change: "Screening benchmarks",
      positive: true,
      icon: Briefcase,
      color: "violet" as const,
    },
    {
      label: "Candidates Analyzed",
      value: totalCandidates,
      change: "Processed with NLP",
      positive: true,
      icon: Users,
      color: "emerald" as const,
    },
    {
      label: "Shortlisted",
      value: shortlisted,
      change: totalCandidates > 0 ? `${Math.round((shortlisted / totalCandidates) * 100)}% of candidates` : "0% of candidates",
      positive: shortlisted > 0,
      icon: Star,
      color: "amber" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Recruiter Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live intelligence from SQLite database and transformer matching engine
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {KPIS.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MatchingChart data={analytics?.scoreDistribution} />
          <SkillsChart data={analytics?.skillDemand} />
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentJobs jobs={jobs} />
          <RecentActivity activity={analytics?.recentActivity} />
        </div>
      </div>
    </DashboardLayout>
  );
}
