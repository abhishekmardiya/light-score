// replace with env variable - API key is exposed on client
const PSI_API_KEY = process.env.NEXT_PUBLIC_API_KEY as string;

const CATEGORY_IDS = ["performance", "accessibility", "best-practices", "seo"];
export const INSIGHT_AUDIT_IDS = [
  "forced-reflow-insight",
  "lcp-breakdown-insight",
  "lcp-discovery-insight",
  "cache-insight",
  "image-delivery-insight",
  "legacy-javascript-insight",
  "dom-size-insight",
  "third-parties-insight",
];
export const METRIC_IDS = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "total-blocking-time",
  "speed-index",
  "interactive",
  "cumulative-layout-shift",
];
const AUDIT_IDS = [...new Set([...INSIGHT_AUDIT_IDS, ...METRIC_IDS])];

export interface PSIAudit {
  id: string;
  title: string;
  score: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
}

export interface PSICategory {
  id: string;
  title: string;
  score: number | null;
}

export interface PSILighthouseResult {
  fetchTime: string;
  categories?: Record<string, PSICategory>;
  audits?: Record<string, PSIAudit>;
}

export interface PSIResponse {
  id: string;
  lighthouseResult: PSILighthouseResult;
  loadingExperience?: Record<string, unknown>;
  analysisUTCTimestamp?: string;
}

function trimResponse(raw: Record<string, unknown>): PSIResponse {
  const lh = raw.lighthouseResult as Record<string, unknown> | undefined;
  const categories = lh?.categories as Record<string, Record<string, unknown>> | undefined;
  const audits = lh?.audits as Record<string, Record<string, unknown>> | undefined;

  const trimmedCategories: Record<string, PSICategory> = {};
  for (const id of CATEGORY_IDS) {
    const cat = categories?.[id];
    if (cat) {
      trimmedCategories[id] = {
        id: String(cat.id ?? id),
        title: String(cat.title ?? id),
        score: cat.score != null ? Number(cat.score) : null,
      };
    }
  }

  const trimmedAudits: Record<string, PSIAudit> = {};
  for (const id of AUDIT_IDS) {
    const audit = audits?.[id];
    if (audit) {
      trimmedAudits[id] = {
        id: String(audit.id ?? id),
        title: String(audit.title ?? id),
        score: audit.score != null ? Number(audit.score) : null,
        scoreDisplayMode: audit.scoreDisplayMode as string | undefined,
        displayValue: audit.displayValue as string | undefined,
      };
    }
  }

  return {
    id: String(raw.id ?? ""),
    lighthouseResult: {
      fetchTime: String(lh?.fetchTime ?? new Date().toISOString()),
      categories: trimmedCategories,
      audits: trimmedAudits,
    },
    loadingExperience: raw.loadingExperience as Record<string, unknown> | undefined,
    analysisUTCTimestamp: raw.analysisUTCTimestamp as string | undefined,
  };
}

export async function fetchPageSpeedInsights(
  url: string,
  strategy: "desktop" | "mobile",
  signal?: AbortSignal
): Promise<PSIResponse> {
  const apiUrl = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
  );
  apiUrl.searchParams.set("url", url);
  apiUrl.searchParams.set("strategy", strategy);
  for (const cat of ["performance", "accessibility", "best-practices", "seo"]) {
    apiUrl.searchParams.append("category", cat);
  }
  apiUrl.searchParams.set("key", PSI_API_KEY);
  apiUrl.searchParams.set("_", String(Date.now()));

  const fetchOptions: RequestInit = { cache: "no-store" };
  if (signal) {
    fetchOptions.signal = signal;
  }
  const response = await fetch(apiUrl.toString(), fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error?.message ?? text.slice(0, 200) ?? message;
    } catch {
      message = text.slice(0, 200) || message;
    }
    throw new Error(message);
  }

  const raw = (await response.json()) as Record<string, unknown>;

  if (!raw.lighthouseResult) {
    throw new Error("Invalid response from PageSpeed Insights API");
  }

  return trimResponse(raw);
}
