import {
  Brain,
  Search,
  Users,
  BarChart3,
  Zap,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    color: "indigo",
    title: "Transformer-Based NLP",
    description:
      "Uses BERT and Sentence Transformers to semantically understand resume content — going beyond keyword matching.",
  },
  {
    icon: Search,
    color: "violet",
    title: "Semantic Job Matching",
    description:
      "Matches candidates to job descriptions using deep contextual embeddings and cosine similarity scoring.",
  },
  {
    icon: Users,
    color: "blue",
    title: "Smart Candidate Ranking",
    description:
      "Ranks applicants by composite matching scores considering skills, experience and semantic fit.",
  },
  {
    icon: BarChart3,
    color: "emerald",
    title: "Rich Analytics",
    description:
      "Visualize skill demand, score distributions and hiring funnel data with interactive charts.",
  },
  {
    icon: Zap,
    color: "amber",
    title: "Real-Time Processing",
    description:
      "FastAPI-powered backend processes resumes and runs inference in real-time with low latency.",
  },
  {
    icon: ShieldCheck,
    color: "rose",
    title: "Bias-Aware Screening",
    description:
      "Focuses on skills and experience rather than demographic signals, promoting fair and consistent hiring.",
  },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  violet: "bg-violet-50 text-violet-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

export function FeatureCards() {
  return (
    <section className="py-20 bg-slate-50" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Everything You Need for Smarter Hiring
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            CareerGraph AI brings state-of-the-art NLP to your recruitment
            workflow — no manual effort required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorMap[color]}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
