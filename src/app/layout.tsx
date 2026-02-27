import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lighthouse Score | PageSpeed Insights Auditor",
    template: "%s | Lighthouse Score",
  },
  description:
    "Run PageSpeed Insights audits on multiple URLs. Get performance, SEO, accessibility, and best practices scores. Export to JSON or CSV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
