"use client";

import { Candidate } from "@/types";
import { ScoreBadge, Badge } from "@/components/ui/Badge";
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CandidateProfileProps {
  candidate: Candidate;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-indigo-500" : value >= 55 ? "bg-amber-500" : "bg-red-400";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function CandidateProfile({ candidate: c }: CandidateProfileProps) {
  const radarData = c.scoreBreakdown
    ? [
        { axis: "Skill Match", value: c.scoreBreakdown.skillMatch },
        { axis: "Experience", value: c.scoreBreakdown.experienceMatch },
        { axis: "Education", value: c.scoreBreakdown.educationMatch },
        { axis: "Semantic", value: c.scoreBreakdown.semanticSimilarity },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-extrabold shrink-0">
            {c.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{c.name}</h2>
              <ScoreBadge score={c.matchingScore} />
              <Badge
                variant={
                  c.status === "shortlisted"
                    ? "success"
                    : c.status === "rejected"
                    ? "danger"
                    : "default"
                }
                size="md"
              >
                {c.status}
              </Badge>
            </div>
            <p className="text-slate-600 text-sm mb-2">{c.jobRole}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              {c.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {c.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {c.email}
              </span>
              {c.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {c.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {c.resumeFileName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Breakdown */}
          {c.scoreBreakdown && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Matching Score Breakdown
              </h3>
              <div className="space-y-3">
                <ScoreBar label="Skill Match" value={c.scoreBreakdown.skillMatch} />
                <ScoreBar label="Experience Match" value={c.scoreBreakdown.experienceMatch} />
                <ScoreBar label="Education Match" value={c.scoreBreakdown.educationMatch} />
                <ScoreBar label="Semantic Similarity" value={c.scoreBreakdown.semanticSimilarity} />
              </div>
            </div>
          )}

          {/* Evidence */}
          {c.evidence && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900 mb-1">
                    Why this candidate matched
                  </p>
                  <p className="text-sm text-indigo-800 leading-relaxed">{c.evidence}</p>
                </div>
              </div>
            </div>
          )}

          {/* Work History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-500" /> Work Experience
            </h3>
            <div className="space-y-4">
              {c.workHistory.map((w, i) => (
                <div key={i} className="border-l-2 border-indigo-200 pl-4">
                  <p className="font-semibold text-slate-900 text-sm">{w.title}</p>
                  <p className="text-xs text-slate-500 mb-2">
                    {w.company} · {w.duration}
                  </p>
                  <ul className="space-y-1">
                    {w.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-slate-600 flex items-start gap-1.5">
                        <span className="text-indigo-400 mt-1 shrink-0">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-500" /> Education
            </h3>
            <div className="space-y-3">
              {c.education.map((e, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{e.degree}</p>
                    <p className="text-xs text-slate-500">
                      {e.institution} · {e.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Skill Gap Radar</h3>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: "12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">All Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <span
                  key={s}
                  className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Matched skills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {c.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Missing skills */}
          {c.missingSkills.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-400" /> Skill Gaps
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {c.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
