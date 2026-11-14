import Link from "next/link";
import { Job } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Users, ArrowRight, Briefcase } from "lucide-react";

interface RecentJobsProps {
  jobs?: Job[];
}

export function RecentJobs({ jobs = [] }: RecentJobsProps) {
  const displayJobs = jobs.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Job Openings</h2>
          <Link
            href="/jobs"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {displayJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No job descriptions created yet.</p>
            <Link
              href="/jobs"
              className="text-indigo-600 hover:underline mt-1 inline-block font-medium"
            >
              Create a job posting
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayJobs.map((job) => (
              <Link
                key={job.id}
                href="/jobs"
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    {job.candidateCount}
                  </div>
                  <Badge
                    variant={
                      job.status === "active"
                        ? "success"
                        : job.status === "draft"
                        ? "warning"
                        : "default"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
