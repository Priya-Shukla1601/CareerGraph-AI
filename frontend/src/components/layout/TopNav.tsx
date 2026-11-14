"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Activity, CheckCheck, Trash2, X } from "lucide-react";
import {
  fetchNotifications,
  clearNotifications,
  SystemNotification,
  BASE_URL
} from "@/lib/api";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Recruiter Dashboard",
  "/upload": "Upload Resumes",
  "/jobs": "Job Descriptions",
  "/candidates": "Candidate Ranking",
  "/compare": "Candidate Comparison",
  "/analytics": "Analytics",
  "/settings": "System Settings",
  "/help": "Help & Documentation",
  "/profile": "Recruiter Profile",
};

export function TopNav() {
  const pathname = usePathname();
  const basePath = "/" + pathname.split("/")[1];
  const label = ROUTE_LABELS[basePath] ?? "CareerGraph AI";

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearing, setClearing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check backend health & notifications on mount
  useEffect(() => {
    let active = true;

    async function checkHealthAndNotifications() {
      try {
        const res = await fetch(`${BASE_URL}/health`);
        if (active) {
          setBackendOnline(res.ok);
        }
      } catch {
        if (active) setBackendOnline(false);
      }

      const notifRes = await fetchNotifications();
      if (active && notifRes.data) {
        setNotifications(notifRes.data);
      }
    }

    checkHealthAndNotifications();
    const interval = setInterval(checkHealthAndNotifications, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const handleClearNotifications = async () => {
    setClearing(true);
    await clearNotifications();
    setNotifications([]);
    setClearing(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{label}</h1>
        <p className="text-xs text-slate-500">
          CareerGraph AI · Recruitment Intelligence
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search candidates, jobs..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
          />
        </div>

        {/* Real Backend Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
            backendOnline
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : backendOnline === false
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline
                ? "bg-emerald-500 animate-pulse"
                : backendOnline === false
                ? "bg-rose-500"
                : "bg-slate-400"
            }`}
          />
          <span>{backendOnline ? "System Online" : "Connecting..."}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Notifications"
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">
                    System Notifications
                  </span>
                  {notifications.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {notifications.length}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    disabled={clearing}
                    className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link */}
        <Link
          href="/profile"
          title="User Profile"
          className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform hover:scale-105"
        >
          P
        </Link>
      </div>
    </header>
  );
}
