"use client";

import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TechSection } from "@/components/landing/TechSection";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#technology", label: "Technology" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">CareerGraph AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-700"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-700 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/dashboard">
              <Button size="sm" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Page sections */}
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <TechSection />
      <Footer />
    </div>
  );
}
