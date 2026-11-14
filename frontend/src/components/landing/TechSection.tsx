const TECHNOLOGIES = [
  { name: "BERT", category: "NLP Model", color: "indigo" },
  { name: "Sentence Transformers", category: "Embeddings", color: "violet" },
  { name: "FastAPI", category: "Backend", color: "emerald" },
  { name: "PyTorch", category: "Deep Learning", color: "orange" },
  { name: "Hugging Face", category: "Model Hub", color: "yellow" },
  { name: "Cosine Similarity", category: "Scoring", color: "blue" },
  { name: "spaCy", category: "NLP Pipeline", color: "teal" },
  { name: "Next.js 14", category: "Frontend", color: "slate" },
  { name: "Python 3.11", category: "Language", color: "sky" },
  { name: "Recharts", category: "Visualization", color: "rose" },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  slate: "bg-slate-100 text-slate-700 border-slate-300",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

export function TechSection() {
  return (
    <section className="py-20 bg-slate-50" id="technology">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Powered by State-of-the-Art AI
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Built on a modern, production-ready AI stack combining the best of
            NLP research and software engineering.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {TECHNOLOGIES.map(({ name, category, color }) => (
            <div
              key={name}
              className={`inline-flex flex-col items-center border rounded-xl px-5 py-4 hover:shadow-sm transition-all ${colorMap[color]}`}
            >
              <span className="font-semibold text-sm">{name}</span>
              <span className="text-xs opacity-70 mt-0.5">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
