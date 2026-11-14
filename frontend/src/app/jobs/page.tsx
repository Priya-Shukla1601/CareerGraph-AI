"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobForm } from "@/components/jobs/JobForm";
import { JobList } from "@/components/jobs/JobList";
import { Job } from "@/types";
import { fetchJobs, deleteJob, matchCandidates } from "@/lib/api";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      setLoading(true);
      const res = await fetchJobs();
      if (active && res.data) {
        setJobs(res.data);
      }
      setLoading(false);
    }

    loadJobs();
    return () => {
      active = false;
    };
  }, []);

  const handleJobCreated = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
    setStatusMessage({
      type: "success",
      text: `Job '${job.title}' created and saved to database successfully!`,
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDelete = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!confirm(`Are you sure you want to delete job '${job?.title ?? id}'?`)) {
      return;
    }

    const res = await deleteJob(id);
    if (res.error) {
      setStatusMessage({ type: "error", text: res.error });
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setStatusMessage({
        type: "success",
        text: `Job deleted from database successfully.`,
      });
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleMatch = async (id: string) => {
    setMatchingId(id);
    setStatusMessage(null);

    const res = await matchCandidates(id);
    setMatchingId(null);

    if (res.error) {
      setStatusMessage({ type: "error", text: res.error });
    } else {
      const count = res.data?.length ?? 0;
      setStatusMessage({
        type: "success",
        text: `AI evaluated and ranked ${count} candidate(s) for this role. Redirecting to Candidate Rankings...`,
      });
      setTimeout(() => {
        router.push("/candidates");
      }, 1500);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {statusMessage && (
          <div
            className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          {/* Form – takes 2 columns */}
          <div className="xl:col-span-2">
            <JobForm onJobCreated={handleJobCreated} />
          </div>

          {/* List – takes 3 columns */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Database Job Descriptions
                </h2>
                <p className="text-xs text-slate-500">
                  Persistent job benchmarks stored in SQLite
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                {loading ? "..." : jobs.length} total
              </span>
            </div>

            <JobList
              jobs={jobs}
              onDelete={handleDelete}
              onMatch={handleMatch}
              matchingId={matchingId}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
