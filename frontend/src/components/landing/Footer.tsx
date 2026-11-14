import { Brain, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">CareerGraph AI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Transformer-based intelligent resume screening and semantic job
              matching system. Capstone project demonstrating applied NLP in
              recruitment.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">Product</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/upload" className="hover:text-white transition-colors">Upload Resumes</Link>
              <Link href="/jobs" className="hover:text-white transition-colors">Job Descriptions</Link>
              <Link href="/candidates" className="hover:text-white transition-colors">Candidates</Link>
              <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>
          </div>

          {/* Tech links */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">Technology</p>
            <div className="flex flex-col gap-2 text-sm">
              <span>BERT / Sentence Transformers</span>
              <span>FastAPI Backend</span>
              <span>Next.js 14 Frontend</span>
              <span>PyTorch · Hugging Face</span>
              <span>spaCy NLP Pipeline</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © 2026 CareerGraph AI · Capstone Project · Built with ❤️ using NLP
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <span className="text-sm font-semibold">GitHub</span>
            </a>
            <a
              href="mailto:contact@careergraph.ai"
              className="hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
