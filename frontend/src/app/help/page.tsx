"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  HelpCircle,
  Upload,
  Briefcase,
  Users,
  GitCompare,
  BarChart3,
  Brain,
  FileCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const WORKFLOW_STEPS = [
  {
    step: "1",
    title: "Upload Resumes",
    icon: Upload,
    description:
      "Upload PDF or DOCX candidate resumes. The backend extracts full text, emails, contact details, experience, education, and technical skills automatically using PyMuPDF and NLP entity parsers.",
    href: "/upload",
  },
  {
    step: "2",
    title: "Define Job Descriptions",
    icon: Briefcase,
    description:
      "Create job postings with target role titles, minimum & maximum years of experience, required skills, and preferred skills for the screening benchmark.",
    href: "/jobs",
  },
  {
    step: "3",
    title: "AI Matching & Scoring",
    icon: Brain,
    description:
      "Run the AI matching pipeline. CareerGraph AI computes multi-dimensional scores: semantic alignment, required skill coverage, experience match, and education fit.",
    href: "/candidates",
  },
  {
    step: "4",
    title: "Candidate Comparison",
    icon: GitCompare,
    description:
      "Select candidates to compare side by side on a skill overlap matrix, experience timeline, and multi-axis radar score visualization.",
    href: "/compare",
  },
  {
    step: "5",
    title: "Analytics & Shortlisting",
    icon: BarChart3,
    description:
      "Review scoring distributions, talent pool skill distribution, shortlisting ratios, and system audit logs in real-time.",
    href: "/analytics",
  },
];

const FAQS = [
  {
    q: "How does the AI Matching Algorithm work?",
    a: "CareerGraph AI evaluates candidates using a 4-dimensional scoring model: Semantic Similarity (40%) evaluates contextual role alignment; Skill Match (35%) calculates exact and fuzzy coverage of required and preferred skills; Experience Match (15%) assesses candidate seniority against job requirements; and Education Match (10%) scores degree relevance.",
  },
  {
    q: "Where are uploaded resumes stored?",
    a: "Uploaded resumes are permanently stored on disk in the backend 'uploads/' folder with unique UUID filenames to prevent overwrites, while candidate structured metadata is stored in the SQLite database.",
  },
  {
    q: "What file formats are supported?",
    a: "Standard PDF (.pdf) and Microsoft Word (.docx) documents up to 15MB are supported for direct automated extraction.",
  },
  {
    q: "Does the system work without internet access?",
    a: "Yes! CareerGraph AI uses local NLP text extraction, TF-IDF vectorization, and scikit-learn cosine similarity engines that execute completely offline on your host machine without sending candidate data to external third parties.",
  },
  {
    q: "How can I shortlist or reject a candidate?",
    a: "Navigate to the Candidates page, where you can star a candidate to toggle shortlisted status, or open the detailed candidate profile to inspect evidence and work history.",
  },
];

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Help & Documentation Guide
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Learn how to use CareerGraph AI for transformer-based resume screening, candidate ranking, and job matching
          </p>
        </div>

        {/* Workflow Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            End-to-End Application Workflow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKFLOW_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-4 border border-slate-100 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {s.step}
                      </span>
                      <Icon className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60">
                    <Link
                      href={s.href}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                    >
                      Open {s.title} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Architecture Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI & NLP Architecture Overview
          </h2>

          <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              <strong>Text Extraction & Normalization:</strong> Resumes are parsed using PyMuPDF and python-docx. Text is cleaned by lowercasing, removing noise, and stripping stopwords. Contact details (email, phone) and education credentials (degrees, passing years) are extracted via regex pattern recognizers.
            </p>
            <p>
              <strong>Skill Extraction:</strong> Over 50+ technology patterns across languages, frameworks, AI/ML tools, cloud platforms, and databases are detected and matched against job criteria.
            </p>
            <p>
              <strong>Semantic Similarity:</strong> Text from candidate resumes and job descriptions is vectorized using TF-IDF n-grams (1, 2) and evaluated via Cosine Similarity, measuring contextual fit beyond keyword matching.
            </p>
            <p>
              <strong>Transparent Evidence:</strong> Every candidate match generates human-readable reasoning explaining why the candidate was assigned their matching score.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-slate-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-3.5 space-y-1">
                <p className="text-sm font-semibold text-slate-900">{faq.q}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
