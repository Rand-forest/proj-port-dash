# Architecture

## Overview

MyApp is a static single-page application built by Vite. React renders the interface, TypeScript checks application contracts, and Cloudflare Pages serves the generated files. Future browser-side data and authentication use the Supabase JavaScript client and Supabase-hosted services.

```text
Browser
  ├── static HTML/CSS/JavaScript ── Cloudflare Pages
  └── authenticated API calls ───── Supabase (Auth + Postgres)

GitHub pull request ── GitHub Actions checks
                    └─ Cloudflare preview deployment
```

There is no application server in this repository. Values prefixed with `VITE_` are embedded into browser assets at build time and must never contain secrets.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/` | React application and nearby automated tests |
| `src/lib/supabase.ts` | Single browser client integration point |
| `docs/` | Product and architecture decisions |
| `.github/workflows/verify.yml` | Pull-request and branch verification |
| `dist/` | Generated production output; never committed |

## Key choices

- **Vite and React:** a small, conventional client application with fast local feedback.
- **Strict TypeScript:** catches interface mistakes before deployment.
- **Supabase client is optional at startup:** CI and the placeholder page work without credentials, while future features have one validated client entry point.
- **Cloudflare Git integration:** produces previews and production deployments without committing an API token or maintaining a deployment workflow.
- **GitHub Actions:** uses the lockfile and runs installation, type checking, linting, tests, and a production build on every pull request and pushes to `main`.

## Security boundaries

- `.env*` is ignored except for the placeholder-only `.env.example`.
- Only the Supabase project URL and publishable/anon key belong in the browser. A service-role key must never be used here.
- The anon key identifies the project; authorization comes from Supabase Row Level Security. Enable RLS and test policies for every table before a feature reads or writes it.
- Authentication state is untrusted input. Database policies, not hidden UI elements, enforce access.
- Dependency updates must pass CI and should be reviewed for necessity.

## Quality and release flow

Vitest and Testing Library verify visible behavior in a browser-like environment. ESLint checks React, TypeScript, and hooks conventions. `tsc` checks both app and tool configuration. Vite's production build is the final compilation check.

A contributor opens a pull request, GitHub Actions runs all checks, and Cloudflare creates a preview. The owner reviews the preview. Only an approved merge to `main` triggers the production deployment. Rollback is performed from Cloudflare Pages by selecting a previously successful deployment, then the source change should be reverted in GitHub.

## Evolution rules

Keep frontend code feature-oriented as functionality grows, but do not create empty abstractions in advance. Record consequential or hard-to-reverse decisions in this document. If server-only secrets or privileged operations become necessary, use Supabase database functions or Edge Functions and document their threat model rather than placing secrets in Vite code.
