export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const URL_SPLIT_REGEX = /\s*[,\n]\s*/;

export function parseUrls(text: string): string[] {
  return text
    .split(URL_SPLIT_REGEX)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import { INSIGHT_AUDIT_IDS } from "@/lib/psi-api";

const EST_SAVINGS_REGEX = /Est savings of/i;

export function hasHighEffectInsight(audit: {
  score?: number | null;
  displayValue?: string;
}): boolean {
  if (audit.score !== null && audit.score !== undefined && audit.score < 0.5) {
    return true;
  }
  return EST_SAVINGS_REGEX.test(audit.displayValue ?? "");
}

export function psiResultsToCsv(
  results: Array<{
    url: string;
    strategy: string;
    data: {
      lighthouseResult: {
        categories?: Record<string, { score: number | null }>;
        audits?: Record<
          string,
          { title?: string; score?: number | null; displayValue?: string }
        >;
      };
    };
  }>
): string {
  const categoryIds = ["performance", "accessibility", "best-practices", "seo"];
  const header = `URL,Strategy,${categoryIds.join(",")},Insights\n`;

  const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  const rows = results.map((r) => {
    const cats = r.data.lighthouseResult.categories ?? {};
    const audits = r.data.lighthouseResult.audits ?? {};
    const scores = categoryIds.map((id) =>
      cats[id]?.score !== null && cats[id]?.score !== undefined
        ? Math.round((cats[id].score ?? 0) * 100)
        : ""
    );
    const insightAudits = INSIGHT_AUDIT_IDS.map((id) => audits[id])
      .filter(Boolean)
      .filter(hasHighEffectInsight);
    const insights = insightAudits.map((a) => a.title ?? "").join("; ");
    return [r.url, r.strategy, ...scores, insights].map(quote).join(",");
  });

  return header + rows.join("\n");
}
