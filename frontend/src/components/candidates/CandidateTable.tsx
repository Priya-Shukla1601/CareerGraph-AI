
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Candidate } from "@/types";
import {
  fetchCandidates,
  updateCandidateStatus,
  deleteCandidate,
} from "@/lib/api";

import { ScoreBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  StarOff,
  Eye,
  Trash2,
} from "lucide-react";

type SortDir = "asc" | "desc";

export function CandidateTable() {
  const router = useRouter();

  // Real candidates fetched from the backend
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // --------------------------------------------------
  // FETCH REAL CANDIDATES FROM SQLITE DATABASE
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadCandidates() {
      setLoading(true);
      setLoadError(null);

      const result = await fetchCandidates();

      if (!active) return;

      if (result.error || !result.data) {
        setLoadError(
          result.error ?? "Unable to load candidates from database."
        );
      } else {
        setCandidates(result.data);
      }

      setLoading(false);
    }

    loadCandidates();

    return () => {
      active = false;
    };
  }, []);

  // --------------------------------------------------
  // SORT CANDIDATES
  // --------------------------------------------------

  const toggleSort = () => {
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
  };

  // --------------------------------------------------
  // UPDATE CANDIDATE STATUS IN DATABASE
  // --------------------------------------------------

  const handleShortlist = async (id: string) => {
    const candidate = candidates.find((c) => c.id === id);

    if (!candidate) return;

    const newStatus =
      candidate.status === "shortlisted"
        ? "pending"
        : "shortlisted";

    setActionError(null);

    const result = await updateCandidateStatus(id, newStatus);

    if (result.error || !result.data) {
      setActionError(
        result.error ?? "Could not update candidate status."
      );
      return;
    }

    // Update UI only after backend confirms success
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus }
          : c
      )
    );
  };

  // --------------------------------------------------
  // DELETE CANDIDATE FROM DATABASE & DISK
  // --------------------------------------------------

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete candidate "${name}"? This will permanently delete their resume file.`)) {
      return;
    }

    setActionError(null);
    const result = await deleteCandidate(id);

    if (result.error || !result.data) {
      setActionError(result.error ?? "Failed to delete candidate.");
      return;
    }

    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  // --------------------------------------------------
  // SEARCH, FILTER AND SORT
  // --------------------------------------------------

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        const q = search.toLowerCase();

        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.jobRole || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
        );
      })
      .filter(
        (c) =>
          statusFilter === "all" ||
          c.status === statusFilter
      )
      .sort((a, b) =>
        sortDir === "desc"
          ? b.matchingScore - a.matchingScore
          : a.matchingScore - b.matchingScore
      );
  }, [candidates, search, statusFilter, sortDir]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

      {/* Toolbar */}

      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            id="candidate-search"
          />
        </div>

        <div className="flex items-center gap-2">

          {/* Status Filter */}

          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            {["all", "shortlisted", "pending", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 capitalize font-medium transition-colors ${
                  statusFilter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSort}
            icon={
              sortDir === "desc" ? (
                <ArrowDown className="w-3 h-3" />
              ) : (
                <ArrowUp className="w-3 h-3" />
              )
            }
          >
            Score
          </Button>
        </div>
      </div>

      {/* Action Error */}

      {actionError && (
        <p className="px-6 py-3 text-sm text-red-600 bg-red-50">
          {actionError}
        </p>
      )}

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">

              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Candidate
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                Job Role
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  Score
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                Matched Skills
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>

              <th className="px-4 py-3" />

            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {loading ? (

              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Loading candidates from database...
                </td>
              </tr>

            ) : loadError ? (

              <tr>
                <td colSpan={6} className="text-center py-12 text-red-500">
                  {loadError}
                </td>
              </tr>

            ) : filtered.length === 0 ? (

              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  No candidates found in the database.
                </td>
              </tr>

            ) : (

              filtered.map((c) => (

                <tr
                  key={c.id}
                  className="hover:bg-slate-50 transition-colors"
                >

                  {/* Candidate Details */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {c.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {c.email}
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* Job Role */}

                  <td className="px-4 py-4 hidden md:table-cell">
                    <p className="text-slate-700 max-w-[180px] truncate">
                      {c.jobRole || "Not specified"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {c.experience} yrs exp
                    </p>
                  </td>

                  {/* Matching Score */}

                  <td className="px-4 py-4">
                    <ScoreBadge score={c.matchingScore} />
                  </td>

                  {/* Matched Skills */}

                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">

                      {(c.matchedSkills || []).slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-100"
                        >
                          {s}
                        </span>
                      ))}

                      {(c.matchedSkills || []).length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{c.matchedSkills.length - 3}
                        </span>
                      )}

                      {(c.matchedSkills || []).length === 0 && (
                        <span className="text-xs text-slate-400">
                          Not matched yet
                        </span>
                      )}

                    </div>
                  </td>

                  {/* Status */}

                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        c.status === "shortlisted"
                          ? "success"
                          : c.status === "rejected"
                          ? "danger"
                          : "default"
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>

                  {/* Actions */}

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => handleShortlist(c.id)}
                        title={
                          c.status === "shortlisted"
                            ? "Remove from shortlist"
                            : "Shortlist"
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.status === "shortlisted"
                            ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                            : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                      >
                        {c.status === "shortlisted" ? (
                          <StarOff className="w-4 h-4" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/candidates/${c.id}`)
                        }
                        title="View profile"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCandidate(c.id, c.name)}
                        title="Delete candidate and resume"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* Footer */}

      <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
        Showing {loading ? "..." : filtered.length} of {candidates.length} candidates
      </div>

    </div>
  );
}
