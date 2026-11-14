"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import {
  User,
  Mail,
  Building,
  MapPin,
  Briefcase,
  CheckCircle2,
  FileText,
  Star,
  Layers,
  Save,
} from "lucide-react";
import {
  fetchUserProfile,
  updateUserProfile,
  UserProfileData,
} from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData>({
    id: "",
    name: "Priya Shukla",
    email: "priya.recruiter@careergraph.ai",
    role: "Senior Technical Recruiter & AI Lead",
    department: "Talent Acquisition",
    company: "CareerGraph AI",
    location: "Bengaluru, India",
    bio: "Managing technical hiring and AI candidate screening with CareerGraph AI.",
    avatar: "P",
  });

  const [stats, setStats] = useState({
    resumesScreened: 0,
    jobsManaged: 0,
    shortlisted: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      const res = await fetchUserProfile();
      if (res.data?.profile) {
        setProfile(res.data.profile);
      }
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    const res = await updateUserProfile(profile);
    setSaving(false);

    if (res.error || !res.data) {
      setError(res.error ?? "Failed to update profile.");
    } else {
      setProfile(res.data.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Recruiter details and administrative preferences stored in CareerGraph AI
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile updated and saved to the database successfully!
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shrink-0">
              {profile.avatar || profile.name.charAt(0) || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              <p className="text-sm text-indigo-600 font-medium">{profile.role}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {profile.company} ({profile.department})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Activity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.resumesScreened}</p>
              <p className="text-xs text-slate-500">Resumes Screened</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.jobsManaged}</p>
              <p className="text-xs text-slate-500">Jobs Managed</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.shortlisted}</p>
              <p className="text-xs text-slate-500">Candidates Shortlisted</p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Edit Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              id="profile-name"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              id="profile-email"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role / Title"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              id="profile-role"
            />
            <Input
              label="Department"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              id="profile-department"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Organization"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              id="profile-company"
            />
            <Input
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              id="profile-location"
            />
          </div>

          <TextArea
            label="Professional Bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            id="profile-bio"
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
