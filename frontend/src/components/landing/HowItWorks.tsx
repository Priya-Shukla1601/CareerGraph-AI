import { Upload, Cpu, Trophy } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Resumes",
    description:
      "Drag and drop PDF or DOCX resume files. Our parser extracts text, skills, education and work experience automatically.",
    color: "indigo",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Semantic Matching",
    description:
      "Transformer models encode both the job description and each resume into dense vector embeddings. Cosine similarity determines the semantic match.",
    color: "violet",
  },
  {
    step: "03",
    icon: Trophy,
    title: "Ranked Results",
    description:
      "Candidates are ranked by composite score. Recruiters see matched skills, missing skills and AI-generated evidence for each match.",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

export function HowItWorks() {
  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            How CareerGraph AI Works
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Three simple steps from resume upload to intelligent candidate
            recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map(({ step, icon: Icon, title, description, color }, index) => {
            const c = colorMap[color];
            return (
              <div key={step} className="relative">
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-slate-200 -translate-y-1/2 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div
                    className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${c.bg} border ${c.border}`}
                  >
                    <Icon className={`w-8 h-8 ${c.text}`} />
                  </div>
                  <div
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mb-3 ${c.bg} ${c.text} border ${c.border}`}
                  >
                    {step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
