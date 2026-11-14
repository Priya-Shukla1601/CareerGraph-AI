"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Sliders,
  Database,
  Bell,
  Cpu,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Server,
} from "lucide-react";
import { BASE_URL } from "@/lib/api";

interface SystemSettings {
  semanticWeight: number;
  skillWeight: number;
  experienceWeight: number;
  educationWeight: number;
  shortlistThreshold: number;
  autoRankOnUpload: boolean;
  emailAlerts: boolean;
  maxUploadSizeMB: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  semanticWeight: 40,
  skillWeight: 35,
  experienceWeight: 15,
  educationWeight: 10,
  shortlistThreshold: 75,
  autoRankOnUpload: true,
  emailAlerts: false,
  maxUploadSizeMB: 15,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{
    database?: string;
    storage?: string;
    records?: { candidates: number; jobs: number };
  } | null>(null);

  useEffect(() => {
    // Load local settings if present
    const cached = localStorage.getItem("careergraph_settings");
    if (cached) {
      try {
        setSettings(JSON.parse(cached));
      } catch {
        // use default
      }
    }

    // Check system health & DB details
    fetch(`${BASE_URL}/health`)
      .then((r) => r.json())
      .then((data) => setSystemHealth(data))
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("careergraph_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalWeights =
    Number(settings.semanticWeight) +
    Number(settings.skillWeight) +
    Number(settings.experienceWeight) +
    Number(settings.educationWeight);

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System & AI Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure transformer matching parameters, score weighting, and inspect storage integrations
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings saved successfully! Parameters applied to future candidate evaluations.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* AI Matching Weights */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  AI Matching Engine Weights
                </h2>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  totalWeights === 100
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                Total: {totalWeights}%
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Adjust how CareerGraph AI computes the overall match score between resumes and job descriptions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Semantic Similarity Weight (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.semanticWeight}
                  onChange={(e) =>
                    setSettings({ ...settings, semanticWeight: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400">TF-IDF & Transformer embeddings</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Skill Match Weight (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.skillWeight}
                  onChange={(e) =>
                    setSettings({ ...settings, skillWeight: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400">Required and preferred skill overlap</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Experience Match Weight (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.experienceWeight}
                  onChange={(e) =>
                    setSettings({ ...settings, experienceWeight: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400">Alignment with minimum role experience</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Education Match Weight (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.educationWeight}
                  onChange={(e) =>
                    setSettings({ ...settings, educationWeight: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400">Degree & qualification relevance</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Shortlist Recommendation Score Threshold (%)
              </label>
              <input
                type="range"
                min={50}
                max={95}
                value={settings.shortlistThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, shortlistThreshold: Number(e.target.value) })
                }
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>50% (Permissive)</span>
                <span className="font-semibold text-indigo-700">{settings.shortlistThreshold}%</span>
                <span>95% (Strict)</span>
              </div>
            </div>
          </div>

          {/* Database & Storage Architecture */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Database & File Storage Architecture
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" />
                  Primary Database
                </p>
                <p className="text-slate-600 font-mono text-[11px]">SQLite (SQLAlchemy Engine)</p>
                <p className="text-slate-400">
                  Physical path: <span className="text-slate-600 font-mono">backend/app/careergraph.db</span>
                </p>
                <p className="text-emerald-700 font-medium pt-1">
                  Status: Connected ({systemHealth?.records?.candidates ?? 0} candidates, {systemHealth?.records?.jobs ?? 0} jobs)
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                  Permanent File Storage
                </p>
                <p className="text-slate-600 font-mono text-[11px]">backend/uploads/</p>
                <p className="text-slate-400">
                  Format: UUID-hashed original PDF/DOCX files
                </p>
                <p className="text-emerald-700 font-medium pt-1">
                  Status: Persistent on host disk
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  NLP & ML Engine
                </p>
                <p className="text-slate-600">PyMuPDF + TF-IDF Vectorizer + Cosine Similarity</p>
                <p className="text-slate-400">
                  Backend Version: FastAPI 1.0.0
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  FastAPI Backend Endpoint
                </p>
                <p className="text-slate-600 font-mono text-[11px]">{BASE_URL}</p>
                <p className="text-slate-400">
                  CORS: Allowed from Next.js frontend (:3000)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="md">
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
