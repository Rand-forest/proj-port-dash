# MyApp

A small, production-ready starting point for a web application. It uses React, TypeScript, Vite, Supabase, Cloudflare Workers Static Assets, and GitHub Actions—without an application server to maintain.

The current application intentionally shows only **“MyApp is running.”**

## For the owner

### What happens when a change is made?

1. Work is proposed in a GitHub pull request.
2. GitHub automatically checks types, code style, tests, and the production build.
3. Review the Cloudflare Worker version uploaded to the `preview` environment.
4. Merge only when the checks pass and the preview looks right. Deploy the merged `main` branch as Production.

You do not need to run commands for normal reviews. Do not share passwords or the contents of `.env` files in GitHub issues, commits, or chat.

## First-time service setup

Both Supabase and Cloudflare Workers have free plans suitable for a small application.

### Supabase

1. Create a project in [Supabase](https://supabase.com/).
2. In **Project Settings → API**, copy the project URL and the **publishable/anon** key.
3. Copy `.env.example` to `.env.local` and fill in both values.
4. Never put a Supabase service-role key in this application. Browser code is public; protect data with Supabase Row Level Security policies.

The app has a Supabase client ready for future features. It is created only when both public settings are present, so local setup and CI do not need credentials yet.

### Cloudflare Workers

The repository uses current **Workers Static Assets**, not the older Workers Sites feature. Wrangler uploads the Vite output in `dist/`; there is no Worker API or backend. Requests that do not match a file fall back to `index.html` so React client-side routes load correctly.

1. In Cloudflare, create or allow Wrangler to create the Production Worker named `proj-port-dash` and the non-production Worker named `proj-port-dash-preview`.
2. Create these Cloudflare build variables: `DEV_SUPABASE_URL`, `DEV_SUPABASE_PUBLISHABLE_KEY`, `PROD_SUPABASE_URL`, and `PROD_SUPABASE_PUBLISHABLE_KEY`. Use only public browser configuration—never a service-role key or another secret. Set the build command to `npm ci && npm run build:cloudflare`.
3. The Cloudflare build wrapper uses `WORKERS_CI_BRANCH`: `main` maps the PROD pair to the app's `VITE_` variables and sets `VITE_APP_ENV=production`; every other branch maps the DEV pair and sets `VITE_APP_ENV=development`. The build stops with a clear error if its selected pair is missing. Cloudflare supplies `WORKERS_CI_BRANCH`; do not create it yourself.
4. Keep `main` as the Production branch. From a completed Production build, run `npx wrangler deploy`. From a completed Preview build, run `npx wrangler versions upload --env preview`.
5. In the Worker settings, enable a `workers.dev` address or add a custom domain for Production. Give the preview Worker its own non-production address. A versions upload creates a version without automatically changing Production traffic; use Cloudflare's version/traffic controls when you want reviewers to visit it.

Cloudflare authentication belongs in Cloudflare's deployment integration or CI secrets, never in this repository. No Supabase or Cloudflare credential is committed here.

## Developer setup

Requirements: a maintained Node.js 22 release and npm.

```bash
npm install
cp .env.example .env.local # optional until a feature uses Supabase
npm run dev
```

Open the local address printed by Vite. Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run typecheck` | Check TypeScript without producing files |
| `npm run lint` | Check code style and common mistakes |
| `npm test` | Run the automated tests once |
| `npm run test:watch` | Re-run tests while editing |
| `npm run build` | Create the production site in `dist/` |
| `npm run build:cloudflare` | Select DEV or PROD browser configuration from the Cloudflare branch, then build |
| `npm run preview` | Preview the production build locally |
| `npx wrangler deploy` | Upload `dist/` to the Production Worker |
| `npx wrangler versions upload --env preview` | Upload `dist/` as a non-production Worker version |

Commit `package-lock.json` whenever dependencies change. CI uses `npm ci` for repeatable installation.

### Local database foundation

MIG-04 adds a version-controlled Supabase schema, RLS policies, trusted mutation functions, sanitized seed data, and pgTAP policy tests under `supabase/`. With the Supabase CLI and its normal local prerequisites installed, `supabase db reset` rebuilds the local database from zero and `supabase test db` runs the database tests. These commands target local/DEV work only; applying a migration to Production requires separate owner approval.

## Documentation

- [Product intent and scope](docs/PRODUCT.md)
- [Architecture and operating notes](docs/ARCHITECTURE.md)
- [Supabase schema](docs/SUPABASE_SCHEMA.md)
- [RLS policy matrix](docs/RLS_POLICY_MATRIX.md)
- [RPC contract](docs/RPC_CONTRACT.md)
- [Instructions for coding agents](AGENTS.md)
