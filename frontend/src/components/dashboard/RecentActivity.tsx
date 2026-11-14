import { Clock, Activity } from "lucide-react";

interface RecentActivityProps {
  activity?: { name: string; action: string; time: string }[];
}

export function RecentActivity({ activity = [] }: RecentActivityProps) {
  const displayItems = activity.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
          <span className="text-xs text-slate-400">Audit Stream</span>
        </div>

        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No recent activity recorded.</p>
            <p className="text-slate-400 mt-0.5">Upload resumes or create jobs to start tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayItems.map((item, i) => (
              <div key={i} className="px-6 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                  {item.name?.charAt(0) || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed truncate">
                    {item.action}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
