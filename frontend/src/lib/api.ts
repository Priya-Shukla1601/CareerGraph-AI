// ============================================================
// CareerGraph AI – Centralized Real API Utility
// Directly integrated with FastAPI & SQLite Database
// ============================================================

import { Candidate, Job, JobInput, ApiResponse } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ============================================================
// Types
// ============================================================

export interface ParsedResume {
  id: string;
  filename: string;
  extracted_text: string;
  email: string | null;
  phone: string | null;
  skills: string[];
}

interface ResumeUploadResponse {
  success: boolean;
  message: string;
  candidate: ParsedResume;
}

interface SingleCandidateResponse {
  success: boolean;
  candidate: Candidate;
  extracted_text?: string;
}

interface CandidatesResponse {
  success: boolean;
  total: number;
  candidates: Candidate[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  company: string;
  location: string;
  bio: string;
  avatar: string;
  updatedAt?: string;
}

export interface AnalyticsData {
  totalCandidates: number;
  totalResumes: number;
  activeJobs: number;
  shortlisted: number;
  scoreDistribution: { range: string; count: number }[];
  skillDemand: { skill: string; count: number }[];
  experienceDistribution: { range: string; count: number }[];
  jobCandidates: { job: string; count: number }[];
  recentActivity: { name: string; action: string; time: string }[];
}

// ============================================================
// Common API Safe Fetch Utility
// ============================================================

async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        data: null,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data: T = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error connecting to backend.",
    };
  }
}

// ============================================================
// Resume API
// ============================================================

export async function uploadResumes(
  files: File[]
): Promise<ApiResponse<{ uploaded: number; results: ParsedResume[] }>> {
  const results: ParsedResume[] = [];

  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/api/resumes/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`${file.name}: HTTP ${response.status} - ${errorBody}`);
      }

      const result: ResumeUploadResponse = await response.json();

      if (!result.success || !result.candidate) {
        throw new Error(`${file.name}: Resume upload was unsuccessful.`);
      }

      results.push(result.candidate);
    }

    return {
      data: {
        uploaded: results.length,
        results,
      },
      error: null,
      isDemo: false,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Resume upload failed.",
      isDemo: false,
    };
  }
}

export async function parseResume(
  id: string
): Promise<ApiResponse<Candidate>> {
  const { data, error } = await safeFetch<SingleCandidateResponse>(
    `${BASE_URL}/api/resumes/${id}/parse`
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not retrieve parsed resume.",
      isDemo: false,
    };
  }

  return {
    data: data.candidate,
    error: null,
    isDemo: false,
  };
}

// ============================================================
// Candidate API
// ============================================================

export async function fetchCandidates(): Promise<ApiResponse<Candidate[]>> {
  const { data, error } = await safeFetch<CandidatesResponse>(
    `${BASE_URL}/api/candidates`
  );

  if (error || !data) {
    return {
      data: [],
      error: error ?? "Could not fetch candidates from database.",
      isDemo: false,
    };
  }

  return {
    data: data.candidates,
    error: null,
    isDemo: false,
  };
}

export async function fetchCandidate(
  id: string
): Promise<ApiResponse<Candidate>> {
  const { data, error } = await safeFetch<SingleCandidateResponse>(
    `${BASE_URL}/api/candidates/${id}`
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Candidate not found.",
      isDemo: false,
    };
  }

  return {
    data: data.candidate,
    error: null,
    isDemo: false,
  };
}

export async function updateCandidateStatus(
  id: string,
  status: "shortlisted" | "pending" | "rejected"
): Promise<ApiResponse<{ success: boolean }>> {
  const { data, error } = await safeFetch<SingleCandidateResponse>(
    `${BASE_URL}/api/candidates/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not update candidate status.",
      isDemo: false,
    };
  }

  return {
    data: { success: data.success },
    error: null,
    isDemo: false,
  };
}

export async function deleteCandidate(
  id: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  const { data, error } = await safeFetch<{ success: boolean; message: string }>(
    `${BASE_URL}/api/candidates/${id}`,
    {
      method: "DELETE",
    }
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not delete candidate.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

export async function compareCandidates(
  ids: string[]
): Promise<ApiResponse<Candidate[]>> {
  const { data, error } = await safeFetch<{ success: boolean; candidates: Candidate[] }>(
    `${BASE_URL}/api/candidates/compare`,
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    }
  );

  if (error || !data) {
    return {
      data: [],
      error: error ?? "Could not compare candidates.",
      isDemo: false,
    };
  }

  return {
    data: data.candidates,
    error: null,
    isDemo: false,
  };
}

// ============================================================
// Job API
// ============================================================

export async function createJob(
  job: JobInput
): Promise<ApiResponse<Job>> {
  const { data, error } = await safeFetch<Job>(
    `${BASE_URL}/api/jobs`,
    {
      method: "POST",
      body: JSON.stringify(job),
    }
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not create job description.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

export async function fetchJobs(): Promise<ApiResponse<Job[]>> {
  const { data, error } = await safeFetch<Job[]>(
    `${BASE_URL}/api/jobs`
  );

  if (error || !data) {
    return {
      data: [],
      error: error ?? "Could not fetch jobs from database.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

export async function deleteJob(
  id: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  const { data, error } = await safeFetch<{ success: boolean; message: string }>(
    `${BASE_URL}/api/jobs/${id}`,
    {
      method: "DELETE",
    }
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not delete job description.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

// ============================================================
// Candidate Matching & Ranking API
// ============================================================

export async function matchCandidates(
  jobId: string
): Promise<ApiResponse<Candidate[]>> {
  const { data, error } = await safeFetch<{
    success: boolean;
    job: Job;
    total: number;
    candidates: Candidate[];
  }>(`${BASE_URL}/api/jobs/${jobId}/match`, {
    method: "POST",
  });

  if (error || !data) {
    return {
      data: [],
      error: error ?? "Could not match candidates for job.",
      isDemo: false,
    };
  }

  return {
    data: data.candidates,
    error: null,
    isDemo: false,
  };
}

export async function rankCandidates(
  jobId: string
): Promise<ApiResponse<Candidate[]>> {
  const { data, error } = await safeFetch<Candidate[]>(
    `${BASE_URL}/api/jobs/${jobId}/rank`
  );

  if (error || !data) {
    return {
      data: [],
      error: error ?? "Could not rank candidates.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

// ============================================================
// Analytics API
// ============================================================

export async function fetchAnalytics(): Promise<ApiResponse<AnalyticsData>> {
  const { data, error } = await safeFetch<{ success: boolean; analytics: AnalyticsData }>(
    `${BASE_URL}/api/analytics`
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not load analytics from database.",
      isDemo: false,
    };
  }

  return {
    data: data.analytics,
    error: null,
    isDemo: false,
  };
}

// ============================================================
// Notifications API
// ============================================================

export async function fetchNotifications(): Promise<ApiResponse<SystemNotification[]>> {
  const { data, error } = await safeFetch<{ success: boolean; notifications: SystemNotification[] }>(
    `${BASE_URL}/api/notifications`
  );

  if (error || !data) {
    return {
      data: [],
      error: error ?? "Could not load notifications.",
      isDemo: false,
    };
  }

  return {
    data: data.notifications,
    error: null,
    isDemo: false,
  };
}

export async function clearNotifications(): Promise<ApiResponse<{ success: boolean }>> {
  const { data, error } = await safeFetch<{ success: boolean }>(
    `${BASE_URL}/api/notifications/clear`,
    {
      method: "POST",
    }
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not clear notifications.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

// ============================================================
// User Profile API
// ============================================================

export async function fetchUserProfile(): Promise<ApiResponse<{ profile: UserProfileData; stats: any }>> {
  const { data, error } = await safeFetch<{ success: boolean; profile: UserProfileData; stats: any }>(
    `${BASE_URL}/api/user/profile`
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not load user profile.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

export async function updateUserProfile(
  profile: Partial<UserProfileData>
): Promise<ApiResponse<{ profile: UserProfileData }>> {
  const { data, error } = await safeFetch<{ success: boolean; profile: UserProfileData }>(
    `${BASE_URL}/api/user/profile`,
    {
      method: "PUT",
      body: JSON.stringify(profile),
    }
  );

  if (error || !data) {
    return {
      data: null,
      error: error ?? "Could not update profile.",
      isDemo: false,
    };
  }

  return {
    data,
    error: null,
    isDemo: false,
  };
}

export { BASE_URL };
