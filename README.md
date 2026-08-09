# MyApp

A small, production-ready starting point for a web application. It uses React, TypeScript, Vite, Supabase, Cloudflare Pages, and GitHub Actions—without a server to maintain.

The current application intentionally shows only **“MyApp is running.”**

## For the owner

### What happens when a change is made?

1. Work is proposed in a GitHub pull request.
2. GitHub automatically checks types, code style, tests, and the production build.
3. Review the preview supplied by Cloudflare Pages.
4. Merge only when the checks pass and the preview looks right. Cloudflare Pages then publishes the `main` branch.

You do not need to run commands for normal reviews. Do not share passwords or the contents of `.env` files in GitHub issues, commits, or chat.

## First-time service setup

Both Supabase and Cloudflare Pages have free plans suitable for a small application.

### Supabase

1. Create a project in [Supabase](https://supabase.com/).
2. In **Project Settings → API**, copy the project URL and the **publishable/anon** key.
3. Copy `.env.example` to `.env.local` and fill in both values.
4. Never put a Supabase service-role key in this application. Browser code is public; protect data with Supabase Row Level Security policies.

The app has a Supabase client ready for future features. It is created only when both public settings are present, so local setup and CI do not need credentials yet.

### Cloudflare Pages

1. In Cloudflare, create a **Pages** project connected to this GitHub repository.
2. Choose the **Vite** framework preset (or set build command `npm run build` and output directory `dist`).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under the Pages project's environment variables for both preview and production.
4. Set the production branch to `main`. Pull requests will receive preview deployments; merging publishes production.

No Cloudflare credentials are stored in GitHub because deployment is handled by Cloudflare's Git integration.

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
| `npm run preview` | Preview the production build locally |

Commit `package-lock.json` whenever dependencies change. CI uses `npm ci` for repeatable installation.

## Documentation

- [Product intent and scope](docs/PRODUCT.md)
- [Architecture and operating notes](docs/ARCHITECTURE.md)
- [Instructions for coding agents](AGENTS.md)
