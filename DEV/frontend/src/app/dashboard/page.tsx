"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  BarChart3,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";

const mockRecords = [
  {
    id: "demo",
    name: "Pro-Series Industrial Motor 400V",
    manufacturer: "IndustrialCorp",
    industry: "Electrical",
    confidence: 94,
    risk: "Low",
    status: "completed",
    date: "2026-08-16",
  },
  {
    id: "2",
    name: "Paracetamol 500mg Tablet",
    manufacturer: "PharmaGen",
    industry: "Pharma",
    confidence: 89,
    risk: "Medium",
    status: "completed",
    date: "2026-08-15",
  },
  {
    id: "3",
    name: "Organic Green Tea",
    manufacturer: "NatureLeaf",
    industry: "Food",
    confidence: 91,
    risk: "Low",
    status: "completed",
    date: "2026-08-14",
  },
  {
    id: "4",
    name: "NPK 20-20-20 Fertilizer",
    manufacturer: "AgriTech",
    industry: "Agriculture",
    confidence: 76,
    risk: "High",
    status: "completed",
    date: "2026-08-13",
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-[var(--secondary)] mt-1">
            Your analyzed product catalog history.
          </p>
        </div>
        <Link
          href="/"
          className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
        >
          <Plus size={15} /> New Analysis
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Analyses", value: mockRecords.length.toString(), icon: FileText },
          { label: "Avg Confidence", value: "87.5%", icon: BarChart3 },
          { label: "This Week", value: "3", icon: Clock },
          { label: "Fast Path Hits", value: "2", icon: Zap },
        ].map((s, i) => (
          <div key={s.label} className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent-blue)]">
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="text"
            placeholder="Search by product name, manufacturer, or industry..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-[var(--border)] rounded-xl text-white text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 transition-all"
          />
        </div>
        <button className="btn-ghost text-sm px-4 py-3 flex items-center gap-2 rounded-xl">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-sm font-semibold text-[var(--secondary)] uppercase tracking-widest">
            Sample Scans
          </h2>
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[10px] text-[var(--muted)] bg-white/5 px-2.5 py-1 rounded-full border border-[var(--border)]">
            Demo Data
          </span>
        </div>
        {mockRecords.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={`/record/${rec.id}`}
              className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-white/10 transition-all group block"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-[var(--accent-blue)] transition-colors">
                    {rec.name}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {rec.manufacturer} • {rec.industry} • {rec.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Confidence */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rec.confidence >= 90
                          ? "bg-emerald-400"
                          : rec.confidence >= 80
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[var(--secondary)] w-8">
                    {rec.confidence}%
                  </span>
                </div>

                {/* Risk Badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    rec.risk === "Low"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : rec.risk === "Medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {rec.risk}
                </span>

                <ChevronRight
                  size={16}
                  className="text-[var(--muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
