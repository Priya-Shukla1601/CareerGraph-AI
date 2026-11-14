"use client";

import { Job } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Users, Clock, Briefcase, Trash2, Sparkles } from "lucide-react";

interface JobListProps {
  jobs: Job[];
  onDelete?: (id: string) => void;
  onMatch?: (id: string) => void;
  matchingId?: string | null;
}

function formatDate(iso: string) {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function JobList({ jobs, onDelete, onMatch, matchingId }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-700 font-semibold text-sm mb-1">
          No job descriptions created yet.
        </p>
        <p className="text-slate-500 text-xs">
          Create your first job description on the left to begin screening and matching candidates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {job.title}
                </h3>
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
              <p className="text-sm text-slate-500 mb-2">{job.company}</p>
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.requiredSkills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
                {job.preferredSkills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center bg-violet-50 text-violet-600 border border-violet-100 rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="flex items-center gap-2">
                {onMatch && (
                  <button
                    onClick={() => onMatch(job.id)}
                    disabled={matchingId === job.id}
                    title="Match and rank candidates for this job"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${matchingId === job.id ? "animate-spin" : ""}`} />
                    {matchingId === job.id ? "Matching..." : "Match AI"}
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete job"
                    title="Delete job description"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-left sm:text-right text-xs text-slate-400">
                <div className="flex items-center sm:justify-end gap-1 text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>{job.candidateCount} evaluated</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(job.createdAt)}</span>
                </div>
                <div className="mt-0.5">
                  {job.minExperience}–{job.maxExperience} yrs exp
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
