"use client";

import { Candidate } from "@/types";
import { ScoreBadge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, Minus, AlertCircle } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#10b981"];

interface ComparePanelProps {
  selected: Candidate[];
}

function SkillChip({
  skill,
  matched,
  missing,
}: {
  skill: string;
  matched: boolean;
  missing: boolean;
}) {
  if (matched)
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs">
        <CheckCircle2 className="w-3 h-3" /> {skill}
      </span>
    );
  if (missing)
    return (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-full px-2.5 py-0.5 text-xs">
        <XCircle className="w-3 h-3" /> {skill}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 text-xs">
      <Minus className="w-3 h-3" /> {skill}
    </span>
  );
}

export function ComparePanel({ selected }: ComparePanelProps) {
  if (selected.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-slate-600 font-medium text-sm">
          Select at least 2 candidates above to compare their qualifications side by side.
        </p>
        <p className="text-slate-400 text-xs mt-1">
          You can select up to 4 candidates from the pool for comparison.
        </p>
      </div>
    );
  }

  // Collect all unique skills across all selected candidates (extracted skills + matched/missing)
  const allSkills = Array.from(
    new Set(
      selected.flatMap((c) => [
        ...(c.skills || []),
        ...(c.matchedSkills || []),
        ...(c.missingSkills || []),
      ])
    )
  ).slice(0, 20);

  // Radar chart data - check if any candidate has scoreBreakdown
  const hasScoreBreakdown = selected.some((c) => c.scoreBreakdown != null);
  const radarData = hasScoreBreakdown
    ? [
        {
          axis: "Skill Match",
          ...Object.fromEntries(
            selected.map((c) => [
              (c.name || "Candidate").split(" ")[0],
              c.scoreBreakdown?.skillMatch ?? 0,
            ])
          ),
        },
        {
          axis: "Experience",
          ...Object.fromEntries(
            selected.map((c) => [
              (c.name || "Candidate").split(" ")[0],
              c.scoreBreakdown?.experienceMatch ?? 0,
            ])
          ),
        },
        {
          axis: "Education",
          ...Object.fromEntries(
            selected.map((c) => [
              (c.name || "Candidate").split(" ")[0],
              c.scoreBreakdown?.educationMatch ?? 0,
            ])
          ),
        },
        {
          axis: "Semantic",
          ...Object.fromEntries(
            selected.map((c) => [
              (c.name || "Candidate").split(" ")[0],
              c.scoreBreakdown?.semanticSimilarity ?? 0,
            ])
          ),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Radar overlay */}
      {radarData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Score Breakdown Comparison Radar
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Multi-axial comparison across AI matching criteria
          </p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                {selected.map((c, i) => (
                  <Radar
                    key={c.id}
                    name={(c.name || "Candidate").split(" ")[0]}
                    dataKey={(c.name || "Candidate").split(" ")[0]}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side-by-side cards */}
      <div
        className={`grid gap-4 ${
          selected.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : selected.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {selected.map((c, i) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border-2 shadow-sm p-5 flex flex-col justify-between"
            style={{ borderColor: COLORS[i % COLORS.length] + "40" }}
          >
            <div>
              {/* Header */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-3 shadow-sm"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                {c.name?.charAt(0) || "C"}
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{c.name}</h3>
              <p className="text-xs text-slate-500 mb-3 truncate">
                {c.jobRole || "Not specified"}
              </p>

              {/* Score */}
              <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-lg">
                <span className="text-xs text-slate-500">Matching Score</span>
                <ScoreBadge score={c.matchingScore} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-slate-900">
                    {c.experience}
                  </p>
                  <p className="text-xs text-slate-500">Yrs Exp</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {c.education && c.education.length > 0
                      ? c.education[0].degree
                      : "Standard"}
                  </p>
                  <p className="text-xs text-slate-500">Degree</p>
                </div>
              </div>

              {/* Resume File */}
              <div className="mb-4 text-xs text-slate-500 truncate">
                <span className="font-medium text-slate-700">File: </span>
                {c.resumeFileName || "Uploaded PDF"}
              </div>

              {/* Skills */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Detected Skills ({c.skills?.length ?? 0})
                </p>
                <div className="flex flex-wrap gap-1">
                  {(c.skills || []).slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                  {(c.skills?.length ?? 0) > 8 && (
                    <span className="text-[11px] text-slate-400 px-1 py-0.5">
                      +{c.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skill matrix table */}
      {allSkills.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              Technical Skill Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side skill coverage extracted from uploaded resumes
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Skill
                  </th>
                  {selected.map((c) => (
                    <th
                      key={c.id}
                      className="text-center px-4 py-3 text-xs font-semibold text-slate-700 uppercase"
                    >
                      {(c.name || "Candidate").split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSkills.map((skill) => (
                  <tr key={skill} className="hover:bg-slate-50">
                    <td className="px-6 py-2.5 font-medium text-slate-700 text-xs">
                      {skill}
                    </td>
                    {selected.map((c) => {
                      const hasSkill =
                        (c.skills || []).includes(skill) ||
                        (c.matchedSkills || []).includes(skill);
                      return (
                        <td key={c.id} className="px-4 py-2.5 text-center">
                          {hasSkill ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
