"use client";

import { useEffect, useRef, useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultsTable } from "@/components/ResultsTable";
import { UrlInput } from "@/components/UrlInput";
import type { PSIResponse } from "@/lib/psi-api";
import { fetchPageSpeedInsights } from "@/lib/psi-api";
import { formatDuration } from "@/lib/utils";

export type Strategy = "desktop" | "mobile";

export interface PSIResultWithMeta {
  url: string;
  strategy: Strategy;
  data: PSIResponse;
}

export function AuditForm() {
  const [urls, setUrls] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<Strategy>("desktop");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PSIResultWithMeta[]>([]);
  const [progress, setProgress] = useState({ url: "" });
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  async function runAudit() {
    if (urls.length === 0) {
      setError("Please enter at least one valid URL (http:// or https://)");
      return;
    }

    setError(null);
    setResults([]);
    setTotalTimeMs(null);
    setElapsedMs(0);
    setProgress({ url: `${urls.length} URLs` });
    setIsRunning(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    try {
      const startTime = Date.now();
      const settled = await Promise.allSettled(
        urls.map((url) => fetchPageSpeedInsights(url, strategy, signal)),
      );

      const newResults: PSIResultWithMeta[] = [];
      const errors: string[] = [];

      const wasAborted = settled.some(
        (o) => o.status === "rejected" && o.reason?.name === "AbortError",
      );

      settled.forEach((outcome, i) => {
        const url = urls[i];
        if (!url) {
          return;
        }
        if (outcome.status === "fulfilled") {
          newResults.push({ url, strategy, data: outcome.value });
        } else {
          const reason = outcome.reason;
          const message =
            reason?.name === "AbortError"
              ? "Aborted"
              : reason instanceof Error
                ? reason.message
                : "Unknown error";
          errors.push(`${url}: ${message}`);
        }
      });

      setResults(newResults);
      if (errors.length > 0) {
        setError(wasAborted ? "Audit aborted" : errors.join("; "));
      }
      setTotalTimeMs(Date.now() - startTime);
    } finally {
      abortControllerRef.current = null;
      setIsRunning(false);
      setProgress({ url: "" });
    }
  }

  function abortAudit() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  const hasUrls = urls.length > 0;

  return (
    <>
      <section className="mb-8 space-y-4">
        <UrlInput
          urls={urls}
          onUrlsChange={setUrls}
          disabled={isRunning}
          onEnterSubmit={runAudit}
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600">
            <button
              type="button"
              onClick={() => setStrategy("desktop")}
              disabled={isRunning}
              className={`rounded-l-md px-4 py-2 text-base font-medium transition-colors ${
                isRunning
                  ? strategy === "desktop"
                    ? "cursor-not-allowed bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "cursor-not-allowed bg-white text-zinc-400 opacity-50 dark:bg-zinc-800 dark:text-zinc-500"
                  : strategy === "desktop"
                    ? "cursor-pointer bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "cursor-pointer bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setStrategy("mobile")}
              disabled={isRunning}
              className={`rounded-r-md px-4 py-2 text-base font-medium transition-colors ${
                isRunning
                  ? strategy === "mobile"
                    ? "cursor-not-allowed bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "cursor-not-allowed bg-white text-zinc-400 opacity-50 dark:bg-zinc-800 dark:text-zinc-500"
                  : strategy === "mobile"
                    ? "cursor-pointer bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "cursor-pointer bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Mobile
            </button>
          </div>
          <button
            type="button"
            onClick={runAudit}
            disabled={!hasUrls || isRunning}
            className={`rounded-lg bg-zinc-900 px-6 py-2.5 text-base font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 ${
              hasUrls && !isRunning ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            {isRunning ? "Running..." : "Run Audit"}
          </button>
        </div>
      </section>

      {error && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      {isRunning && (
        <section className="mb-8 overflow-visible rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Progress
            </h2>
            {strategy && (
              <span className="rounded-md border border-zinc-300 px-2.5 py-1 text-sm font-medium text-zinc-700 dark:border-zinc-500 dark:text-zinc-300">
                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
              </span>
            )}
            <button
              type="button"
              onClick={abortAudit}
              className="ml-auto cursor-pointer rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
            >
              Abort
            </button>
          </div>
          <ProgressBar currentUrl={progress.url} elapsedMs={elapsedMs} />
        </section>
      )}

      {results.length > 0 && (
        <section>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:mr-auto">
              Results ({results.length})
              {totalTimeMs !== null && (
                <span className="ml-2 text-base font-normal text-zinc-500 dark:text-zinc-400">
                  — completed in {formatDuration(totalTimeMs)}
                </span>
              )}
            </h2>
            <ExportButtons results={results} disabled={isRunning} />
          </div>
          <ResultsTable results={results} />
        </section>
      )}
    </>
  );
}
