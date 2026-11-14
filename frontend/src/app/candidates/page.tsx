import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CandidateTable } from "@/components/candidates/CandidateTable";


export const metadata = {
  title: "Candidates – CareerGraph AI",
};

export default function CandidatesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Candidates</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              AI-matched candidates ranked by semantic similarity score
            </p>
          </div>
        </div>
        <CandidateTable />
      </div>
    </DashboardLayout>
  );
}
