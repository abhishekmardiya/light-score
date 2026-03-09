# Lighthouse Score

Run PageSpeed Insights audits on multiple URLs. Bulk input, progress tracking, and export to JSON/CSV.

## Features

- **Bulk URL input** – Add URLs one at a time with the Add button (or paste comma-separated to add multiple)
- **PageSpeed Insights** – Performance, SEO, Accessibility, Best Practices scores
- **Desktop/Mobile toggle** – Choose strategy per run
- **Progress tracking** – Real-time progress while audits run
- **Export** – Download results as JSON or CSV
- **Client-side API calls** – Audits run from your browser via PageSpeed Insights API

> Note: Since we use CSR, the API key is exposed to the client. Ensure you restrict your API key to specific domains in the Google Cloud Console to prevent unauthorized use.

- **Client-rendered** – API calls and related components run on the client to reduce server bills

## API Key

This app uses the [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started). You need an API key for production use.

1. Get an API key from [Google Cloud Console](https://developers.google.com/speed/docs/insights/v5/get-started#APIKey)
2. Replace the placeholder in `src/lib/psi-api.ts` with your key
3. For production, restrict the key by HTTP referrer in Google Cloud Console

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

**Note:** Audits run client-side via the PageSpeed Insights API. No server-side Chrome or Node dependencies required. Deploy to any static host (Vercel, Netlify, etc.).

## Tech Stack

- Next.js 16, React 19, Tailwind CSS 4
- [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started?utm_source=lh-chrome-ext)
