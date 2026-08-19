"use client";

import UploadZone from "@/components/UploadZone";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Search,
  ArrowRight,
  FileText,
  BarChart3,
  Globe2,
  Layers,
  ChevronRight,
  Bot,
} from "lucide-react";

const stats = [
  { label: "Industries Supported", value: "8+", icon: Globe2 },
  { label: "Attributes Extracted", value: "50+", icon: Layers },
  { label: "Inference Speed", value: "<50ms", icon: Zap },
  { label: "Accuracy Rate", value: "94%", icon: BarChart3 },
];

const features = [
  {
    icon: Bot,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Autonomous AI Agents",
    desc: "When your PDF is missing specs, our agents autonomously search the web, scrape data, and judge quality before filling gaps.",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Tamper-Proof Records",
    desc: "Every extraction is cryptographically signed with HMAC-SHA256. Modify a single byte and the hash breaks — verifiable live.",
  },
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Hybrid Fast Path",
    desc: "DistilBERT ONNX models deliver <50ms CPU inference for industry classification. No GPU required.",
  },
  {
    icon: Search,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "3-Tier Web Research",
    desc: "DuckDuckGo → Playwright/Jina → Firecrawl OSS → Gemini fallback. Each tier is scored by an LLM-as-Judge.",
  },
  {
    icon: Globe2,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    title: "Industry Agnostic",
    desc: "Zero-shot classification adapts to electrical, pharma, food, agri, software, and more. No retraining needed.",
  },
  {
    icon: FileText,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "PDF Report Generation",
    desc: "Automatic executive one-pager and full pipeline report rendered as downloadable PDF with WeasyPrint.",
  },
];

const steps = [
  { num: "01", title: "Upload PDF", desc: "Drag-and-drop any product catalog, datasheet, or spec sheet." },
  { num: "02", title: "AI Extraction", desc: "8-stage pipeline extracts, validates, scores, and classifies data." },
  { num: "03", title: "Agent Research", desc: "Autonomous agents fill missing gaps by searching the web." },
  { num: "04", title: "Verified Report", desc: "Download a tamper-proof, HMAC-signed intelligence report." },
];

export default function Home() {
  return (
    <div className="flex flex-col relative z-10">
      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--secondary)]">
            Open-Source Product Intelligence
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-balance leading-[1.05]"
        >
          <span className="text-gradient-hero">From PDF to </span>
          <br className="hidden md:block" />
          <span className="text-gradient-accent">Product Intelligence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-[var(--secondary)] max-w-2xl mx-auto text-balance leading-relaxed mb-12"
        >
          Upload any product catalog. Our AI agents extract structured data,
          validate it against industry rules, and fill missing specs by
          researching the web — all in seconds.
        </motion.p>

        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <UploadZone />
        </motion.div>

        {/* Try demo link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center gap-4 text-sm"
        >
          <span className="text-[var(--muted)]">No PDF?</span>
          <Link
            href="/record/demo"
            className="text-[var(--accent-blue)] font-medium flex items-center gap-1 hover:underline underline-offset-4"
          >
            View sample report <ArrowRight size={13} />
          </Link>
        </motion.div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-t border-b border-[var(--border)] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <s.icon size={20} className="text-[var(--accent-blue)] mb-2" />
              <span className="text-3xl font-extrabold text-white tracking-tight stat-glow">
                {s.value}
              </span>
              <span className="text-xs text-[var(--secondary)] mt-1 font-medium">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            How It Works
          </h2>
          <p className="text-[var(--secondary)] max-w-lg mx-auto">
            Four steps from raw PDF to verified, tamper-proof product intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative glass-panel rounded-2xl p-6 group hover:border-white/10 transition-colors"
            >
              <span className="text-4xl font-extrabold text-white/[0.04] absolute top-4 right-4">
                {step.num}
              </span>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-widest">
                  Step {step.num}
                </span>
                {i < steps.length - 1 && (
                  <ChevronRight
                    size={12}
                    className="text-[var(--muted)] hidden md:block"
                  />
                )}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Built for Production
          </h2>
          <p className="text-[var(--secondary)] max-w-lg mx-auto">
            Enterprise-grade security, agentic AI, and zero cloud dependency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel rounded-2xl p-6 group hover:border-white/10 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.bg} ${f.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <f.icon size={20} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass-panel-strong rounded-3xl p-12 text-center relative overflow-hidden dot-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
            Ready to extract intelligence?
          </h2>
          <p className="text-[var(--secondary)] mb-8 max-w-md mx-auto relative z-10">
            Create an account and start analyzing your first product catalog in under 60 seconds.
          </p>
          <div className="flex items-center justify-center gap-4 relative z-10">
            <Link
              href="/register"
              className="btn-primary text-sm px-8 py-3 flex items-center gap-2"
            >
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link
              href="/record/demo"
              className="btn-ghost text-sm px-6 py-3"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
