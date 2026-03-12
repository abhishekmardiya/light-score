"use client";

import Link from "next/link";
import { useState } from "react";
import { isValidUrl } from "@/lib/utils";

const PASTE_SPLIT = /\s*[,\n]\s*/;

interface UrlInputProps {
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  disabled?: boolean;
  onEnterSubmit?: () => void;
}

const CHIP_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
];

export function UrlInput({
  urls,
  onUrlsChange,
  disabled,
  onEnterSubmit,
}: UrlInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [duplicateNote, setDuplicateNote] = useState<string | null>(null);

  function addUrl() {
    setDuplicateNote(null);
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }
    const candidates = trimmed
      .split(PASTE_SPLIT)
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = candidates.filter((u) => isValidUrl(u));
    const duplicates = valid.filter((u) => urls.includes(u));
    const toAdd = valid.filter((u) => !urls.includes(u));

    if (duplicates.length > 0) {
      setDuplicateNote(
        duplicates.length === 1
          ? "This URL is already added"
          : `${duplicates.length} URLs are already added`
      );
    }
    if (toAdd.length > 0) {
      onUrlsChange([...urls, ...toAdd]);
    }
    setInputValue("");
  }

  function removeUrl(index: number) {
    onUrlsChange(urls.filter((_, i) => i !== index));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addUrl();
      } else if (urls.length > 0 && onEnterSubmit) {
        onEnterSubmit();
      }
    }
  };

  const hasUrls = urls.length > 0;
  const inputUrls = inputValue
    .trim()
    .split(PASTE_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);
  const canAdd = inputUrls.some((u) => isValidUrl(u));

  return (
    <div className="w-full space-y-3">
      <label
        htmlFor="url-input"
        className="block text-base font-medium text-zinc-700 dark:text-zinc-300"
      >
        Add URLs
      </label>
      <div className="flex gap-2">
        <input
          id="url-input"
          type="url"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setDuplicateNote(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="https://example.com"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={disabled || !inputValue.trim() || !canAdd}
          className={`shrink-0 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
            canAdd && !disabled
              ? "cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
          }`}
        >
          Add
        </button>
      </div>
      {!!duplicateNote && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {duplicateNote}
        </p>
      )}
      {hasUrls && (
        <div className="flex flex-col gap-2">
          {urls.map((url, i) => (
            <span
              key={`${i}-${url}`}
              className={`group flex w-full items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-sm break-all ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
            >
              <span className="min-w-0 flex-1 break-all">
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline text-inherit hover:underline"
                >
                  {url}
                </Link>
              </span>
              <button
                type="button"
                onClick={() => removeUrl(i)}
                disabled={disabled}
                className="shrink-0 flex items-center justify-center rounded-md border border-zinc-300 p-1.5 text-zinc-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-zinc-300 disabled:hover:bg-transparent disabled:hover:text-zinc-500 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 cursor-pointer"
                aria-label={`Remove ${url}`}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label={`Remove ${url}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
