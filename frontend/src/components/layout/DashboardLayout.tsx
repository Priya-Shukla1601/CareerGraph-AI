import { ReactNode, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Suspense fallback={<aside className="w-64 bg-slate-900 h-screen shrink-0" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Suspense fallback={<header className="h-16 bg-white border-b border-slate-200 shrink-0" />}>
          <TopNav />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
