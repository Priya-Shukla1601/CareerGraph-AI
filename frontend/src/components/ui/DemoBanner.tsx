"use client";

import { FlaskConical, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-amber-800">
        <FlaskConical className="w-4 h-4 shrink-0" />
        <p className="text-sm">
          <span className="font-semibold">Demo Mode –</span> Data shown below
          is simulated for UI development. Matching scores are{" "}
          <strong>not</strong> actual transformer predictions. Connect the
          FastAPI backend to use real AI results.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-600 hover:text-amber-900 shrink-0"
        aria-label="Dismiss demo banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
