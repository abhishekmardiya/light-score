"use client";

import type { PSIResultWithMeta } from "@/components/AuditForm";
import type { PSIAudit } from "@/lib/psi-api";
import { INSIGHT_AUDIT_IDS } from "@/lib/psi-api";
import Link from "next/link";

function getInsightEffectScore(audit: PSIAudit): number {
  const dv = audit.displayValue ?? "";
  const savingsMatch = dv.match(/Est savings of ([\d,]+)\s*(KiB|ms)/i);
  if (!savingsMatch) {
    return audit.score !== null && audit.score < 0.5 ? 1 : 0;
  }
  const value = Number.parseFloat(savingsMatch[1].replace(/,/g, "")) || 0;
  const unit = savingsMatch[2].toLowerCase();
  return unit === "kib" ? value : value / 1000;
}

function hasHighEffect(audit: PSIAudit): boolean {
  if (audit.score !== null && audit.score < 0.5) {
    return true;
  }
  return /Est savings of/i.test(audit.displayValue ?? "");
}

const CATEGORY_ORDER = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
] as const;

function getScoreColor(score: number | null) {
  if (score === null) {
    return "stroke-zinc-200 dark:stroke-zinc-600";
  }
  const num = Math.round(score * 100);
  if (num >= 90) {
    return "stroke-emerald-600 dark:stroke-emerald-500";
  }
  if (num >= 50) {
    return "stroke-orange-500 dark:stroke-orange-400";
  }
  return "stroke-red-600 dark:stroke-red-500";
}

function getScoreTextColor(score: number | null) {
  if (score === null) {
    return "text-zinc-500 dark:text-zinc-400";
  }
  const num = Math.round(score * 100);
  if (num >= 90) {
    return "text-emerald-700 dark:text-emerald-400 font-bold";
  }
  if (num >= 50) {
    return "text-orange-600 dark:text-orange-400 font-bold";
  }
  return "text-red-700 dark:text-red-400 font-bold";
}

const CIRCLE_RADIUS = 14;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function ScoreGauge({ label, score }: { label: string; score: number | null }) {
  const num = score !== null ? Math.round(score * 100) : null;
  const strokeDasharray =
    num !== null
      ? `${(num / 100) * CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`
      : `0 ${CIRCLE_CIRCUMFERENCE}`;
  const strokeColor = getScoreColor(score);
  const textColor = getScoreTextColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-14 w-14">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden="true"
          role="img"
        >
          <title>Score: {num ?? "N/A"}</title>
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className="stroke-zinc-200 dark:stroke-zinc-600"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className={strokeColor}
            strokeWidth="3.5"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            strokeDashoffset="0"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${textColor}`}
        >
          {num ?? "—"}
        </span>
      </div>
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
    </div>
  );
}

function InsightItem({ audit }: { audit: PSIAudit }) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-100 py-2.5 last:border-b-0 dark:border-zinc-700">
      <span className="shrink-0 text-xs text-red-500">▲</span>
      <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {audit.title}
      </span>
    </div>
  );
}

function buildPageSpeedUrl(url: string, strategy: string): string {
  const params = new URLSearchParams();
  params.set("url", url);
  params.set("form_factor", strategy);
  for (const cat of ["performance", "accessibility", "best-practices", "seo"]) {
    params.append("category", cat);
  }
  return `https://pagespeed.web.dev/analysis?${params.toString()}`;
}

export function ResultsTable({ results }: { results: PSIResultWithMeta[] }) {
  return (
    <div className="flex flex-col gap-6">
      {results.map((result, index) => {
        const { url, strategy, data } = result;
        const categories = data.lighthouseResult.categories ?? {};

        const scores = CATEGORY_ORDER.map((id) => ({
          id,
          title: categories[id]?.title ?? id,
          score: categories[id]?.score ?? null,
        }));

        const pageSpeedUrl = buildPageSpeedUrl(url, strategy);
        const audits = data.lighthouseResult.audits ?? {};
        const insightAudits = INSIGHT_AUDIT_IDS.map((id) => audits[id])
          .filter(Boolean)
          .filter(hasHighEffect);
        const sortedInsights = [...insightAudits].sort(
          (a, b) => getInsightEffectScore(b) - getInsightEffectScore(a)
        );

        return (
          <div
            key={`${url}-${data.lighthouseResult.fetchTime}-${index}`}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-800"
          >
            <div className="mb-4">
              <Link
                prefetch={false}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 hover:underline dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-200 dark:hover:bg-zinc-700"
                title={url}
              >
                <span className="break-all">{url}</span>
              </Link>
            </div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
              <div className="flex flex-wrap gap-8">
                {scores.map(({ id, title, score }) => (
                  <ScoreGauge key={id} label={title} score={score} />
                ))}
              </div>
              <Link
                prefetch={false}
                href={pageSpeedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                View detailed score
              </Link>
            </div>
            {sortedInsights.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
                <h3 className="border-b border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:text-red-400">
                  Insights
                </h3>
                <div className="px-4 py-2">
                  {sortedInsights.map((audit) => (
                    <InsightItem key={audit.id} audit={audit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
