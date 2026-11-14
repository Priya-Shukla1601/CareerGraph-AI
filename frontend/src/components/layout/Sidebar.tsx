"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Briefcase,
  Users,
  BarChart3,
  GitCompare,
  ChevronLeft,
  ChevronRight,
  Brain,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/upload", label: "Upload Resumes", icon: Upload },
      { href: "/jobs", label: "Job Descriptions", icon: Briefcase },
      { href: "/candidates", label: "Candidates", icon: Users },
      { href: "/compare", label: "Compare", icon: GitCompare },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Support",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/help", label: "Help", icon: HelpCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">
              CareerGraph AI
            </p>
            <p className="text-xs text-slate-400 whitespace-nowrap">
              Recruitment Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <p className="px-4 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.section}
              </p>
            )}
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center shadow-md z-10"
        aria-label="Toggle sidebar"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Footer Profile Link */}
      {!collapsed ? (
        <Link
          href="/profile"
          className="p-4 border-t border-slate-800 hover:bg-slate-800/60 transition-colors flex items-center gap-3 group"
          title="Go to Recruiter Profile"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:bg-indigo-600 transition-colors">
            P
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-indigo-200 transition-colors">
              Priya Shukla
            </p>
            <p className="text-xs text-slate-400 truncate">Lead Recruiter</p>
          </div>
        </Link>
      ) : (
        <Link
          href="/profile"
          className="p-3 border-t border-slate-800 flex justify-center hover:bg-slate-800/60 transition-colors"
          title="Priya Shukla · Lead Recruiter"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
        </Link>
      )}
    </aside>
  );
}
