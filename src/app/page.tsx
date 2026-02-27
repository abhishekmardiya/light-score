import { AuditForm } from "@/components/AuditForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Lighthouse Score
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Run PageSpeed Insights audits on multiple URLs. Get performance,
            SEO, accessibility, and best practices scores.
          </p>
        </header>
        <AuditForm />
      </div>
    </div>
  );
}
