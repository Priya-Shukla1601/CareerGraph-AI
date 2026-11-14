import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerGraph AI – Intelligent Resume Screening & Job Matching",
  description:
    "Transformer-based intelligent resume screening, semantic job matching and candidate recommendation system powered by state-of-the-art NLP.",
  keywords: [
    "AI recruitment",
    "resume screening",
    "job matching",
    "NLP",
    "transformer models",
    "CareerGraph AI",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
