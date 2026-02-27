"use client";

import { psiResultsToCsv, downloadBlob, hasHighEffectInsight } from "@/lib/utils";
import { INSIGHT_AUDIT_IDS } from "@/lib/psi-api";
import type { PSIResultWithMeta } from "@/components/AuditForm";

interface ExportButtonsProps {
  results: PSIResultWithMeta[];
  disabled?: boolean;
}

function exportToJson(results: PSIResultWithMeta[]): void {
  const data = results.map((r) => {
    const categories = r.data.lighthouseResult.categories ?? {};
    const audits = r.data.lighthouseResult.audits ?? {};
    const toScore = (s: number | null | undefined) =>
      s != null ? Math.round(s * 100) : null;
    const scores = {
      performance: toScore(categories.performance?.score),
      accessibility: toScore(categories.accessibility?.score),
      "best-practices": toScore(categories["best-practices"]?.score),
      seo: toScore(categories.seo?.score),
    };
    const insightAudits = INSIGHT_AUDIT_IDS.map((id) => audits[id])
      .filter(Boolean)
      .filter(hasHighEffectInsight);
    const insights = insightAudits.map((a) => a.title ?? "").filter(Boolean);

    return {
      url: r.url,
      strategy: r.strategy,
      scores,
      insights,
    };
  });
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, `pagespeed-audit-${Date.now()}.json`);
}

function exportToCsv(results: PSIResultWithMeta[]): void {
  const csv = psiResultsToCsv(results);
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, `pagespeed-audit-${Date.now()}.csv`);
}

export function ExportButtons({ results, disabled }: ExportButtonsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => exportToJson(results)}
        disabled={disabled}
        className={`rounded-lg border border-zinc-300 bg-white px-4 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        Export JSON
      </button>
      <button
        type="button"
        onClick={() => exportToCsv(results)}
        disabled={disabled}
        className={`rounded-lg border border-zinc-300 bg-white px-4 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        Export CSV
      </button>
    </div>
  );
}
