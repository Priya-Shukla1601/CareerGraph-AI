"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ComparePanel } from "@/components/compare/ComparePanel";
import { Candidate, Job } from "@/types";
import { fetchCandidates, fetchJobs, matchCandidates } from "@/lib/api";
import { ScoreBadge } from "@/components/ui/Badge";
import { X, Users, Upload, Sparkles, Briefcase } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selected, setSelected] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      const [candRes, jobRes] = await Promise.all([
        fetchCandidates(),
        fetchJobs(),
      ]);

      if (!active) return;

      if (candRes.data) {
        setCandidates(candRes.data);
        // By default select up to the first 2 candidates
        if (candRes.data.length >= 2) {
          setSelected([candRes.data[0], candRes.data[1]]);
        } else if (candRes.data.length === 1) {
          setSelected([candRes.data[0]]);
        }
      }

      if (jobRes.data) {
        setJobs(jobRes.data);
        if (jobRes.data.length > 0) {
          setSelectedJobId(jobRes.data[0].id);
        }
      }

      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const toggleCandidate = (c: Candidate) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === c.id);
      if (exists) return prev.filter((p) => p.id !== c.id);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, c];
    });
  };

  const handleMatchAgainstJob = async () => {
    if (!selectedJobId) return;
    setMatching(true);
    const res = await matchCandidates(selectedJobId);
    setMatching(false);

    if (res.data && res.data.length > 0) {
      setCandidates(res.data);
      // Re-select corresponding candidates with updated scores
      const updatedSelected = res.data.filter((c) =>
        selected.some((s) => s.id === c.id)
      );
      setSelected(updatedSelected.length > 0 ? updatedSelected : res.data.slice(0, 2));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Candidate Comparison
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select candidates side by side to compare skills, qualifications, and AI matching scores
            </p>
          </div>

          {jobs.length > 0 && candidates.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm self-start sm:self-auto">
              <Briefcase className="w-4 h-4 text-slate-400 ml-1" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs text-slate-700 bg-transparent focus:outline-none pr-2 font-medium"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
              <button
                onClick={handleMatchAgainstJob}
                disabled={matching || !selectedJobId}
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${matching ? "animate-spin" : ""}`} />
                {matching ? "Matching..." : "Evaluate for Job"}
              </button>
            </div>
          )}
        </div>

        {/* Candidate Pool Selector */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400 text-sm">
            Loading candidates from database...
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 text-base mb-1">
              No candidates found in database
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Upload candidate resumes to start comparing candidates side by side.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Resumes
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">
                Select Candidates ({selected.length}/4)
              </p>
              <span className="text-xs text-slate-400">
                {candidates.length} candidate(s) in database
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidates.map((c) => {
                const isSelected = !!selected.find((s) => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCandidate(c)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {c.name?.charAt(0) || "C"}
                    </div>
                    <span>{c.name}</span>
                    <ScoreBadge score={c.matchingScore} />
                    {isSelected && <X className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Compare panel */}
        {candidates.length > 0 && <ComparePanel selected={selected} />}
      </div>
    </DashboardLayout>
  );
}
