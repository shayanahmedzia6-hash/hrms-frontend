# HRMS Frontend

Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4. This repository owns the web UI; the NestJS API owns authorization and persistence.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local`, set `API_INTERNAL_BASE_URL=http://localhost:4000/api/v1` (server-only).
3. Start the NestJS backend and configure its Atlas URI and secrets first.
4. `npm run dev`, open `http://localhost:3000/login`.
5. Sign in as the platform admin created by the backend's `bootstrap:platform` command; create businesses/branches/invitations in the Platform console.

## Folder guide

```text
src/
  app/                 Next.js routes
  components/
    auth/               Access JWT in memory, refresh session, protected workspace
    organization/       Scoped branch and role administration
    platform/           Super Admin tenant onboarding
    layout/             Shell and navigation
    theme/              Light/dark mode
    ui/                 Reusable visual components
  lib/                  Navigation and future API helpers
  styles/
    tokens.css          THE ONLY FILE WITH COLOR VALUES
    layout.css          Styles using design tokens
```

Changing the entire brand palette means editing `src/styles/tokens.css` only. There is one responsive web app; roles change what data and actions are allowed, not which frontend is deployed.

**Status:** Phase 1 login, invitation acceptance, TOTP account setup, platform onboarding, branch/role administration and permission-based navigation are connected to the API. The dashboard intentionally shows no fake financial or employee totals. Attendance, payroll, finance and most HR workflows are still placeholders.

The same frontend serves Super Admin, Business Admin, Branch Manager and Employee roles. All sensitive access decisions are made again by the NestJS backend. The browser sends `/api/v1/*` requests to its own origin; Next.js forwards them to the backend to avoid cross-site refresh-cookie issues.

## Verify

```bash
npm run lint
npm run build
```
