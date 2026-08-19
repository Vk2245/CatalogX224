"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ChevronRight,
  Download,
  FileJson2,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
  Globe2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Bot,
} from "lucide-react";

interface Attribute {
  name: string;
  value: string | number;
  unit?: string;
  confidence: number;
  source_text?: string;
}

interface ProductRecord {
  product_name: string;
  manufacturer: string;
  part_number: string;
  industry: string;
  category: string;
  record_confidence: number;
  validation_passed: boolean;
  risk_level: string;
  content_hash: string;
  record_data: { attributes: Attribute[] };
  risks: { rule: string; status: string }[];
}

const DEMO_DATA: ProductRecord = {
  product_name: "Pro-Series Industrial Motor 400V",
  manufacturer: "IndustrialCorp",
  part_number: "MOT-400V-X9",
  industry: "Electrical Engineering",
  category: "Motors & Drives / AC Motors",
  record_confidence: 0.94,
  validation_passed: true,
  risk_level: "Low",
  content_hash:
    "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  record_data: {
    attributes: [
      { name: "Operating Voltage", value: 400, unit: "V", confidence: 0.98, source_text: '"Rated for 400V AC three-phase operation" — Page 2' },
      { name: "Power Output", value: 15, unit: "kW", confidence: 0.95, source_text: '"Delivers a maximum output of 15kW continuous duty" — Page 3' },
      { name: "IP Rating", value: "IP65", confidence: 0.89, source_text: '"Enclosure rated IP65 against dust ingress and water jets" — Page 4' },
      { name: "Operating Temp", value: "-20 to +60", unit: "°C", confidence: 0.92, source_text: '"Ambient operating temperature range: -20°C to +60°C" — Page 2' },
      { name: "Efficiency Class", value: "IE3", confidence: 0.75, source_text: 'Agent-sourced: IEC 60034-30-1 Premium Efficiency classification' },
      { name: "Weight", value: 42, unit: "kg", confidence: 0.88, source_text: '"Net weight approx. 42 kg without mounting bracket" — Page 5' },
      { name: "Frame Size", value: "160M", confidence: 0.91, source_text: '"Standard IEC frame size 160M" — Page 1' },
      { name: "Insulation Class", value: "F", confidence: 0.87, source_text: '"Class F insulation with Class B temperature rise" — Page 3' },
    ],
  },
  risks: [
    { rule: "CE marking present", status: "pass" },
    { rule: "Voltage rating within standard range", status: "pass" },
    { rule: "IP rating adequate for industrial use", status: "pass" },
    { rule: "Operating temperature range documented", status: "pass" },
    { rule: "Efficiency class meets EU regulation", status: "pass" },
    { rule: "Insulation class appropriate for power rating", status: "pass" },
  ],
};

export default function RecordPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"attributes" | "risks">("attributes");

  useEffect(() => {
    // Simulate API fetch — demo loads instantly
    setTimeout(() => {
      setRecord(DEMO_DATA);
      setLoading(false);
    }, 600);
  }, [params.id]);

  // ── Export JSON (working) ──
  const handleExportJSON = useCallback(() => {
    if (!record) return;
    const blob = new Blob([JSON.stringify(record, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.product_name.replace(/\s+/g, "_")}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [record]);

  // ── Export PDF (working — generates a styled HTML and triggers print) ──
  const handleExportPDF = useCallback(() => {
    if (!record) return;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${record.product_name} — CatalogX Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 48px; color: #1a1a1a; }
  .header { border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 32px; }
  h1 { font-size: 28px; font-weight: 700; }
  .meta { color: #666; font-size: 13px; margin-top: 6px; }
  .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 14px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; padding: 8px 0; border-bottom: 1px solid #eee; }
  td { padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
  .conf-bar { display: inline-block; height: 6px; border-radius: 3px; }
  .hash { font-family: monospace; font-size: 11px; color: #666; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 8px; }
  .footer { margin-top: 40px; text-align: center; color: #ccc; font-size: 11px; }
  @media print { body { padding: 24px; } }
</style></head>
<body>
<div class="header">
  <h1>${record.product_name}</h1>
  <p class="meta">${record.manufacturer} &bull; ${record.part_number} &bull; ${record.industry}</p>
  <p class="meta" style="margin-top:8px">
    AI Confidence: <strong>${(record.record_confidence * 100).toFixed(0)}%</strong> &nbsp;
    Risk Level: <span class="badge">${record.risk_level}</span>
  </p>
</div>
<div class="section">
  <div class="section-title">Extracted Specifications</div>
  <table>
    <tr><th>Attribute</th><th>Value</th><th>Confidence</th><th>Source</th></tr>
    ${record.record_data.attributes.map(a => `
    <tr>
      <td><strong>${a.name}</strong></td>
      <td>${a.value}${a.unit ? ' ' + a.unit : ''}</td>
      <td>${(a.confidence * 100).toFixed(0)}%</td>
      <td style="font-size:11px;color:#888;">${a.source_text || '—'}</td>
    </tr>`).join('')}
  </table>
</div>
<div class="section">
  <div class="section-title">Safety & Compliance</div>
  <table>
    <tr><th>Rule</th><th>Status</th></tr>
    ${record.risks.map(r => `
    <tr><td>${r.rule}</td><td style="color:${r.status === 'pass' ? '#2e7d32' : '#c62828'}; font-weight:600;">${r.status.toUpperCase()}</td></tr>`).join('')}
  </table>
</div>
<div class="section">
  <div class="section-title">Tamper-Proof Hash</div>
  <div class="hash">${record.content_hash}</div>
</div>
<div class="footer">Generated by CatalogX &bull; ${new Date().toLocaleDateString()}</div>
</body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  }, [record]);

  const copyHash = () => {
    if (!record) return;
    navigator.clipboard.writeText(record.content_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-7 h-7 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!record) return null;

  const confPct = (record.record_confidence * 100).toFixed(0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative z-10">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-3 text-sm text-[var(--secondary)]">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <ChevronRight size={12} />
        <span className="text-[var(--accent-blue)]">{record.industry}</span>
        <ChevronRight size={12} />
        <span className="text-white">{record.product_name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-2">
            {record.product_name}
          </h1>
          <p className="text-base text-[var(--secondary)]">
            {record.manufacturer} • Part:{" "}
            <span className="font-mono text-gray-300">
              {record.part_number}
            </span>
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleExportJSON}
            className="btn-ghost text-xs px-4 py-2.5 flex items-center gap-2 rounded-xl"
          >
            <FileJson2 size={14} /> Export JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.08)]"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
          <p className="text-xs text-[var(--secondary)] uppercase tracking-wider mb-1">
            AI Confidence
          </p>
          <p className="text-3xl font-extrabold text-white stat-glow">
            {confPct}%
          </p>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
              style={{ width: `${confPct}%` }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-[var(--secondary)] uppercase tracking-wider mb-1">
            Risk Level
          </p>
          <p
            className={`text-3xl font-extrabold ${
              record.risk_level === "Low"
                ? "text-emerald-400"
                : record.risk_level === "Medium"
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            {record.risk_level}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">
            {record.risks.filter((r) => r.status === "pass").length}/
            {record.risks.length} checks passed
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-[var(--secondary)] uppercase tracking-wider mb-1">
            Industry
          </p>
          <p className="text-lg font-bold text-white flex items-center gap-2">
            <Globe2 size={16} className="text-[var(--accent-blue)]" />
            {record.industry.split(" ")[0]}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2 truncate">
            {record.category}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-[var(--secondary)] uppercase tracking-wider mb-1">
            Attributes
          </p>
          <p className="text-3xl font-extrabold text-white">
            {record.record_data.attributes.length}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">
            {
              record.record_data.attributes.filter(
                (a) => a.confidence >= 0.9
              ).length
            }{" "}
            high-confidence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Table */}
        <div className="lg:col-span-2 glass-panel-strong rounded-2xl p-6">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 mb-6 bg-white/[0.02] rounded-xl p-1 border border-[var(--border)]">
            <button
              onClick={() => setActiveTab("attributes")}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                activeTab === "attributes"
                  ? "bg-white/10 text-white"
                  : "text-[var(--muted)] hover:text-[var(--secondary)]"
              }`}
            >
              <BarChart3 size={14} className="inline mr-2 -mt-0.5" />
              Specifications ({record.record_data.attributes.length})
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                activeTab === "risks"
                  ? "bg-white/10 text-white"
                  : "text-[var(--muted)] hover:text-[var(--secondary)]"
              }`}
            >
              <ShieldAlert size={14} className="inline mr-2 -mt-0.5" />
              Safety Checks ({record.risks.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "attributes" ? (
              <motion.div
                key="attrs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                        Attribute
                      </th>
                      <th className="pb-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                        Value
                      </th>
                      <th className="pb-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider text-right">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.record_data.attributes.map((attr, idx) => (
                      <React.Fragment key={idx}>
                        <motion.tr
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                          onClick={() =>
                            setExpandedRow(expandedRow === idx ? null : idx)
                          }
                        >
                          <td className="py-3.5 text-sm font-medium text-gray-200">
                            {attr.name}
                          </td>
                          <td className="py-3.5 text-sm font-mono text-white">
                            {attr.value}{" "}
                            {attr.unit && (
                              <span className="text-[var(--accent-blue)]">
                                {attr.unit}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    attr.confidence >= 0.9
                                      ? "bg-emerald-400"
                                      : attr.confidence >= 0.75
                                      ? "bg-amber-400"
                                      : "bg-red-400"
                                  }`}
                                  style={{
                                    width: `${attr.confidence * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-mono text-[var(--secondary)] w-7">
                                {(attr.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                        {/* Expanded Source */}
                        <AnimatePresence>
                          {expandedRow === idx && attr.source_text && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <td
                                colSpan={3}
                                className="pb-3 pt-0 px-0"
                              >
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs text-[var(--secondary)] italic leading-relaxed flex items-start gap-3">
                                  <ExternalLink
                                    size={12}
                                    className="shrink-0 mt-0.5 text-[var(--accent-blue)]"
                                  />
                                  {attr.source_text}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                {record.risks.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/5"
                  >
                    <span className="text-sm text-gray-300">{r.rule}</span>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                        r.status === "pass"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {r.status === "pass" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <ShieldAlert size={14} />
                      )}
                      {r.status}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Tamper Proof */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-[var(--secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" /> Tamper Proof
            </h3>
            <p className="text-[10px] text-[var(--muted)] mb-2 uppercase tracking-wider">
              HMAC-SHA256 Signature
            </p>
            <div className="bg-black/40 border border-white/5 p-3 rounded-xl relative group">
              <code className="text-[11px] text-emerald-400 break-all font-mono leading-relaxed">
                {record.content_hash}
              </code>
              <button
                onClick={copyHash}
                className="absolute top-2 right-2 text-[var(--muted)] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                {copiedHash ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-3 leading-relaxed">
              Modify any field and the hash will break. Verify anytime via{" "}
              <code className="text-[var(--accent-blue)]">/api/verify/{'{'}{params.id}{'}'}</code>
            </p>
          </div>

          {/* Agent Insights */}
          <div className="glass-panel rounded-2xl p-5 border-blue-500/10">
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bot size={14} /> Agent Activity
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3.5">
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  <strong className="text-blue-300">Efficiency Class</strong>{" "}
                  was missing from the PDF. Autonomous web agent searched IEC
                  60034-30-1 databases and identified this motor as{" "}
                  <strong className="text-white">IE3 Premium Efficiency</strong>{" "}
                  with 75% confidence.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Research tier used</span>
                <span className="text-[var(--accent-blue)] font-semibold">
                  Tier 1 (DDG + Jina)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Judge score</span>
                <span className="text-emerald-400 font-semibold">0.82 PASS</span>
              </div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-[var(--secondary)] uppercase tracking-wider mb-3">
              Validation
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Required fields", ok: true },
                { label: "Numeric ranges", ok: true },
                { label: "Unit consistency", ok: true },
                { label: "Duplicate check", ok: true },
              ].map((v) => (
                <div
                  key={v.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--secondary)]">{v.label}</span>
                  <CheckCircle2
                    size={14}
                    className="text-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
