// ============================================================
// CareerGraph AI – Shared TypeScript Types
// ============================================================

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  jobRole: string;
  jobId: string;
  matchingScore: number;
  status: "shortlisted" | "pending" | "rejected";
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  experience: number; // years
  education: Education[];
  workHistory: WorkHistory[];
  resumeFileName: string;
  uploadedAt: string;
  evidence?: string;
  scoreBreakdown?: ScoreBreakdown;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  gpa?: string;
}

export interface WorkHistory {
  title: string;
  company: string;
  duration: string;
  highlights: string[];
}

export interface ScoreBreakdown {
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  semanticSimilarity: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  maxExperience: number;
  createdAt: string;
  candidateCount: number;
  status: "active" | "closed" | "draft";
}

export interface ResumeFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
}

export interface KPI {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemo: boolean;
}

export interface JobInput {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  maxExperience: number;
}
