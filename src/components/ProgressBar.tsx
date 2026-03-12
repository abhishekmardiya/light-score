"use client";

import { formatDuration } from "@/lib/utils";

interface ProgressBarProps {
  currentUrl?: string;
  elapsedMs?: number;
}

function ApiCallSvg() {
  return (
    <svg
      className="h-12 w-12 shrink-0 overflow-visible text-zinc-600 dark:text-zinc-400"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Loading"
    >
      <g className="animate-bounce" style={{ animationDuration: "1.2s" }}>
        <circle cx="32" cy="28" r="14" stroke="currentColor" strokeWidth="2" />
        <circle
          cx="28"
          cy="26"
          r="2"
          fill="currentColor"
          className="animate-pulse"
        />
        <circle
          cx="36"
          cy="26"
          r="2"
          fill="currentColor"
          className="animate-pulse"
          style={{ animationDelay: "0.2s" }}
        />
        <path
          d="M26 34 Q32 38 38 34"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <path
        d="M20 48 L24 52 L28 48 L32 52 L36 48 L40 52 L44 48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="opacity-60"
        style={{ animation: "progress-wave 0.8s ease-in-out infinite" }}
      />
    </svg>
  );
}

export function ProgressBar({ currentUrl, elapsedMs }: ProgressBarProps) {
  return (
    <div className="w-full overflow-visible">
      <div className="flex items-center gap-4 overflow-visible rounded-lg border border-zinc-200 bg-zinc-50 px-5 pt-6 pb-4 dark:border-zinc-600 dark:bg-zinc-800/50">
        <div className="flex shrink-0 items-center overflow-visible">
          <ApiCallSvg />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mt-0.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            Lighthouse is doing its thing… this might take some time. Grab some
            coffee ☕
          </p>
          {elapsedMs !== undefined && (
            <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Elapsed: {formatDuration(elapsedMs)}
            </p>
          )}
          {!!currentUrl && (
            <p className="mt-1 truncate text-xs text-zinc-400 dark:text-zinc-500">
              {currentUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
