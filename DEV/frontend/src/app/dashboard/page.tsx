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

import { useEffect, useState } from "react";

interface RecordType {
  id: string;
  document_id: number;
  product_name: string | null;
  manufacturer: string | null;
  industry: string | null;
  risk_level: string | null;
  record_confidence: number | null;
  uploaded_at: string | null;
  status: string;
}

export default function DashboardPage() {
  const [records, setRecords] = useState([] as RecordType[]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API}/api/records/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        }
      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Calculate stats
  let avgConfidence = 0;
  if (records.length > 0) {
    const sum = records.reduce((acc, r) => acc + (r.record_confidence || 0), 0);
    avgConfidence = Math.round((sum / records.length) * 100);
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
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
          { label: "Total Analyses", value: records.length.toString(), icon: FileText },
          { label: "Avg Confidence", value: `${avgConfidence}%`, icon: BarChart3 },
          { label: "This Week", value: records.length.toString(), icon: Clock },
          { label: "Fast Path Hits", value: "0", icon: Zap },
        ].map((s, i) => (
          <div key={s.label} className="glass-panel rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--accent-blue)]">
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">{s.value}</p>
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
            className="w-full pl-10 pr-4 py-3 bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border)] rounded-xl text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
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
            Recent Scans
          </h2>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        
        {isLoading ? (
          <div className="text-center py-10 text-[var(--muted)]">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-[var(--muted)] glass-panel rounded-2xl">
            No product scans found. Upload a document to get started.
          </div>
        ) : (
          records.map((rec, i) => (
            <motion.div
              key={rec.document_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/record/${rec.document_id}`}
                className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[var(--accent-blue)]/50 transition-all group block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--muted)] shrink-0 group-hover:text-[var(--accent-blue)] transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 truncate group-hover:text-[var(--accent-blue)] transition-colors">
                      {rec.product_name || "Unknown Product"}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {rec.manufacturer || "Unknown Mfr"} • {rec.industry || "Unknown Industry"} • {rec.uploaded_at ? new Date(rec.uploaded_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Confidence */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        (rec.record_confidence || 0) >= 0.9
                          ? "bg-emerald-400"
                          : (rec.record_confidence || 0) >= 0.8
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${(rec.record_confidence || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[var(--secondary)] w-8">
                    {Math.round((rec.record_confidence || 0) * 100)}%
                  </span>
                </div>

                {/* Risk Badge */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    rec.risk_level === "low"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : rec.risk_level === "medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {rec.risk_level || "Unknown"}
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
