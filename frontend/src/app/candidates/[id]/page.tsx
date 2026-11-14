"use client";

import { use, useEffect, useState, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CandidateProfile } from "@/components/candidates/CandidateProfile";
import { fetchCandidate } from "@/lib/api";
import { Candidate } from "@/types";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

function CandidateDetails({ params }: PageProps) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCandidate() {
      setLoading(true);
      setError(null);

      const result = await fetchCandidate(id);
      if (!active) return;

      if (result.error || !result.data) {
        setError(result.error ?? "Candidate record not found in database.");
      } else {
        setCandidate(result.data);
      }
      setLoading(false);
    }

    loadCandidate();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-4">
      <Link href="/candidates">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Candidates
        </Button>
      </Link>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading candidate profile from database...</p>
        </div>
      ) : error || !candidate ? (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-12 text-center text-red-600">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-base mb-1">Unable to load candidate</p>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <Link href="/candidates">
            <Button size="sm">Return to Candidate List</Button>
          </Link>
        </div>
      ) : (
        <CandidateProfile candidate={candidate} />
      )}
    </div>
  );
}

export default function CandidateProfilePage({ params }: PageProps) {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">Loading candidate...</p>
          </div>
        }
      >
        <CandidateDetails params={params} />
      </Suspense>
    </DashboardLayout>
  );
}
