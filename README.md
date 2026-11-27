# HRMS Frontend

Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4. This repository owns the web UI; the NestJS API owns authorization and persistence.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and configure API URLs.
3. `npm run dev`, open `http://localhost:3000`.

## Folder guide

```text
src/
  app/                 Next.js routes
  components/
    layout/             Shell and navigation
    theme/              Light/dark mode
    ui/                 Reusable visual components
  lib/                  Navigation and future API helpers
  styles/
    tokens.css          THE ONLY FILE WITH COLOR VALUES
    layout.css          Styles using design tokens
```

Changing the entire brand palette means editing `src/styles/tokens.css` only. There is one responsive web app; roles change what data and actions are allowed, not which frontend is deployed.

**Status:** Architecture and UI foundation. Authentication, live data, and HRMS workflows are not implemented yet. The dashboard intentionally shows no fake financial or employee numbers.

## Verify

```bash
npm run lint
npm run build
```
