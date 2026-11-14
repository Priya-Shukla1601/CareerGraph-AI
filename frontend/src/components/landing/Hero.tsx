"use client";

import Link from "next/link";
import { Brain, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-50 blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-50 blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-sm text-indigo-700 font-medium">
            Transformer-Based AI · BERT · Sentence Transformers
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6 max-w-4xl mx-auto">
          Intelligent Resume Screening &{" "}
          <span className="text-indigo-700">Semantic Job Matching</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          CareerGraph AI uses transformer-based NLP to semantically match
          candidates to job descriptions, rank applicants intelligently and
          eliminate manual screening — at scale.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" variant="primary" icon={<Brain className="w-5 h-5" />}>
              Get Started
            </Button>
          </Link>
          <Link href="/analytics">
            <Button size="lg" variant="outline" icon={<ArrowRight className="w-5 h-5" />}>
              Explore Features
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "95%", label: "Match Accuracy" },
            { value: "10x", label: "Faster Screening" },
            { value: "BERT", label: "Transformer Model" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-indigo-700">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
