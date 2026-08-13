# Current Repository Architecture (MIG-01)

## Assessment scope

This document records the repository state at the start of the Google Apps Script Project Portfolio Dashboard migration. It is an assessment only: MIG-01 does not change application behavior, Cloudflare configuration, Supabase, authentication, dependencies, or Production.

The findings below come from the files currently tracked in this repository. Cloudflare and Supabase account settings that are not represented in Git cannot be verified from this assessment. No live service or database was queried.

## Current Architecture

The repository is a small static single-page application (SPA):

```text
Browser
  ├── downloads HTML, CSS, and JavaScript from Cloudflare Workers Static Assets
  └── may call Supabase directly through the browser client (not currently used by a feature)

Pull request or push to main
  └── GitHub Actions: install → typecheck → lint → test → build

Cloudflare build
  └── branch-aware wrapper: select DEV/PROD public Supabase values → Vite build → dist/
```

React 19 and TypeScript provide the UI, Vite builds it into `dist/`, and Cloudflare Workers Static Assets serves that directory. There is no application server, Worker handler, API layer, router, database schema, or implemented authentication flow in the repository. The only current screen displays `MyApp is running.` and, in development builds, an environment banner.

## Repository Structure

| Path | Current responsibility |
| --- | --- |
| `src/main.tsx` | Finds the root DOM element and mounts the React application in `StrictMode`. |
| `src/App.tsx` | Entire current user interface and development-banner condition. |
| `src/styles.css` | Global page and banner styles. |
| `src/lib/supabase.ts` | Sole Supabase browser-client creation point. |
| `src/App.test.tsx` | UI and environment-banner tests. |
| `src/test/setup.ts` | Adds Testing Library DOM matchers to Vitest. |
| `scripts/build-cloudflare.mjs` | Selects branch-appropriate Supabase browser configuration before a Cloudflare build. |
| `scripts/build-cloudflare.test.mjs` | Tests DEV/PROD selection and missing-variable failure. |
| `vite.config.ts` | React plugin and Vitest browser-like test configuration. |
| `wrangler.jsonc` | Production and Preview Workers Static Assets configuration. |
| `.github/workflows/verify.yml` | Repository verification workflow. |
| `docs/` | Product, architecture, and migration-assessment documentation. |
| `dist/` | Generated build output; ignored and not tracked. |

There is no `supabase/` directory, route directory, Worker source directory, or Google Apps Script source in the tracked tree.

## Frontend

### Framework and entry points

- React `19.1.x`, React DOM `19.1.x`, TypeScript `5.8.x`, and Vite `7.1.x` are installed through npm.
- `index.html` supplies one `#root` element and loads `/src/main.tsx` as an ES module.
- `src/main.tsx` fails clearly if the root element is absent, then renders `<App />` inside React `StrictMode`.
- `src/App.tsx` is the complete application today. There are no feature modules, shared components, client-side routes, forms, dashboard widgets, or state-management layer.
- Styling is a single global `src/styles.css` file.
- TypeScript is strict, does not emit files during type checking, and rejects unused locals, unused parameters, and fall-through switch cases.

### Vite configuration

`vite.config.ts` uses `@vitejs/plugin-react`. It also configures Vitest to use `jsdom` and load `src/test/setup.ts`. It does not define aliases, proxies, custom output settings, environment prefixes, or route handling. Vite therefore uses its standard `dist/` output and standard `VITE_` environment-variable exposure.

The declared browser variables are optional:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_APP_ENV`

Every `VITE_` value is compiled into public browser assets and must not contain a secret.

### Development environment banner

`App` displays `DEVELOPMENT ENVIRONMENT` only when `VITE_APP_ENV` exactly equals `development`. The banner is styled as a centered amber strip. It is absent when the value is `production`, missing, or anything else. Tests cover the explicit development and production cases. Cloudflare non-`main` builds set the development value; the example local environment does too.

## Cloudflare

### Workers configuration

`wrangler.jsonc` configures Workers Static Assets rather than an executable Worker:

- Default/Production Worker name: `proj-port-dash`.
- Preview environment Worker name: `proj-port-dash-preview`.
- Static asset directory: `./dist/` in both environments.
- Missing asset behavior: `single-page-application`, which falls back to the SPA entry page.
- Compatibility date: `2026-08-10`.

There is no Worker `main` entry point, Worker source file, binding, secret declaration, Durable Object, queue, KV namespace, R2 bucket, service binding, or server-side route in the configuration.

### Worker/API structure and existing routes

There is no Worker runtime code or application API. All deployed repository output is static. The SPA fallback can make browser-side paths load `index.html`, but the React application does not currently use a router or define UI routes. No `/api/*` routes exist.

### Preview deployment behavior

The documented flow is:

1. Cloudflare runs `npm ci && npm run build:cloudflare`.
2. A non-`main` `WORKERS_CI_BRANCH` selects DEV Supabase browser settings and creates a development-marked build.
3. `npx wrangler versions upload --env preview` uploads `dist/` to the separately named `proj-port-dash-preview` Worker.
4. A versions upload creates a Worker version but does not itself move traffic. Review access depends on external Cloudflare `workers.dev`, custom-domain, and version/traffic settings.

The repository contains no GitHub Actions deployment job and no committed proof that Cloudflare automatically builds each pull request. That automation, domain setup, credentials, and traffic assignment live outside Git and require account-level verification. Production deployment is documented as `npx wrangler deploy` from a completed `main` build; MIG-01 did not run either deployment command.

## Supabase

### Client integration

`src/lib/supabase.ts` is the required single access point. It reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, creates a `SupabaseClient` only when both are present, and otherwise exports `null`. No application code currently imports or uses that client.

Only a project URL and publishable/anonymous browser key are expected. These identify the Supabase project but are not authorization controls. Any future data access must be protected by database Row Level Security (RLS); a service-role key must never enter Vite/browser configuration.

### Folder, migrations, and schema

There is no tracked `supabase/` folder, Supabase CLI configuration, migration, seed file, generated database type file, SQL file, table definition, RLS policy, database function, trigger, storage policy, or Edge Function. Consequently, this repository defines no existing database schema. A schema might exist in an external Supabase account, but this repository provides no evidence of one and no live database was inspected.

### Authentication

The Supabase dependency is present, but authentication is not implemented. There is no sign-in/sign-out UI, session provider, auth callback, protected route, role model, user profile, or authorization check. The architecture documentation states that future authentication state must be treated as untrusted and that database policies—not hidden UI—must enforce access.

## CI/CD

The single GitHub Actions workflow, `Verify`, runs for every pull request and every push to `main`. It grants read-only repository contents permission, uses Ubuntu, has a 10-minute timeout, checks out the repository, selects Node.js 22 with npm caching, and runs:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm test`
5. `npm run build`

The workflow verifies but does not deploy. It does not use Supabase or Cloudflare credentials and the normal Vite build succeeds without Supabase values because the client configuration is optional. Branch protection and required-check rules are external GitHub settings and cannot be confirmed from repository files.

## Environment Separation

### Local and ordinary Vite builds

`.env.example` documents placeholder-only public values and sets `VITE_APP_ENV=development`. `.gitignore` excludes `.env` and every `.env.*` file except `.env.example`. Local Vite commands use Vite's normal environment-file behavior. The regular GitHub verification build does not run the Cloudflare selection wrapper and does not require Supabase configuration.

### Cloudflare build selection

`scripts/build-cloudflare.mjs` treats `WORKERS_CI_BRANCH === 'main'` as Production and every other value—including a missing value—as Development. It then maps the selected externally supplied pair into the browser variables Vite consumes:

| Cloudflare branch classification | Inputs read by wrapper | Public build outputs | Banner |
| --- | --- | --- | --- |
| `main` | `PROD_SUPABASE_URL`, `PROD_SUPABASE_PUBLISHABLE_KEY` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_APP_ENV=production` | Hidden |
| Any other branch or missing branch | `DEV_SUPABASE_URL`, `DEV_SUPABASE_PUBLISHABLE_KEY` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_APP_ENV=development` | Visible |

The wrapper fails before building if either selected input is empty or missing. This fail-closed behavior prevents a Cloudflare build from silently using an incomplete selected environment.

### DEV variables

`DEV_SUPABASE_URL` and `DEV_SUPABASE_PUBLISHABLE_KEY` are read only by the Cloudflare build wrapper for every non-`main` build. They are copied into `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the child build process, where Vite embeds them in browser JavaScript and `src/lib/supabase.ts` reads them. They should point only to the DEV Supabase project and are intentionally not stored in the repository.

### PROD variables

`PROD_SUPABASE_URL` and `PROD_SUPABASE_PUBLISHABLE_KEY` follow the same mapping only when `WORKERS_CI_BRANCH` is exactly `main`. They should point only to the Production Supabase project and are intentionally not stored in the repository. They are public browser configuration despite the `PROD_` prefix, not server secrets. A preview built from `main` would receive Production values because selection is based on branch, not the Wrangler target; operational procedures must avoid presenting such a build as a DEV-connected preview.

## Security Controls

Current repository controls include:

- local environment files, keys, certificates, build output, coverage, and logs are ignored;
- only placeholder public browser configuration is committed;
- the Supabase integration has one browser-client entry point;
- Cloudflare builds stop if the selected DEV or PROD public pair is incomplete;
- Preview and Production use different Worker names;
- pull requests receive type, lint, test, and build checks;
- GitHub Actions has read-only repository-content permission; and
- repository instructions prohibit Production credentials in development, frontend service-role secrets, automatic destructive Production database operations, and direct work on `main`.

Controls not yet present include application authentication, authorization rules, RLS migrations/tests, server-side secret handling, API input validation, audit logging, and security tests. These are absent because the placeholder application has no accounts, data, or API. Whether repository branch protection, Cloudflare access controls, and actual DEV/PROD Supabase projects are configured correctly must be checked in their respective service consoles.

## Existing Tests

The repository uses Vitest, Testing Library, `jest-dom`, and `jsdom`.

- `src/App.test.tsx` checks the placeholder text, the visible development banner, and the absent Production banner.
- `scripts/build-cloudflare.test.mjs` checks that `main` selects PROD values, feature/missing branch values select DEV, and missing selected variables produce a complete error message.
- No Supabase client, database, authentication, routing, API, accessibility, end-to-end, or deployed-preview tests exist.

Available npm commands are:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite's development server. |
| `npm run typecheck` | Run the TypeScript project build in no-emit mode. |
| `npm run lint` | Run ESLint across the repository. |
| `npm test` | Run Vitest once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run build` | Type-check and create the Vite Production bundle in `dist/`. |
| `npm run build:cloudflare` | Select Cloudflare branch configuration and then run the normal build. |
| `npm run preview` | Serve the built bundle locally through Vite. |

## Migration Readiness

The repository is a clean, deliberately minimal host for a migration. Positive foundations are strict TypeScript, a current React/Vite setup, SPA asset fallback, isolated Preview Worker naming, explicit DEV/PROD build selection, a single Supabase integration point, automated verification, and no legacy application behavior to preserve beyond the placeholder and environment banner.

Architectural conflicts and decisions for a Google Apps Script migration are:

1. **Apps Script server code cannot be copied into this browser-only runtime.** Uses of `SpreadsheetApp`, `DriveApp`, `PropertiesService`, triggers, `google.script.run`, server templates, or other Apps Script services need explicit replacements.
2. **There is no backend/API today.** Privileged operations and secrets cannot be placed in React or `VITE_` variables. Prefer direct Supabase access protected by RLS for ordinary data operations; use a narrowly scoped Supabase database function or Edge Function only where server-side trust is required.
3. **There is no database contract.** Spreadsheet tabs, columns, formulas, identifiers, relationships, validation, history, retention, and ownership must be inventoried before designing version-controlled migrations.
4. **There is no authentication or authorization model.** Google identity/session assumptions from Apps Script will not carry over automatically. Users, roles, access boundaries, and RLS policies require owner approval before implementation.
5. **There is no routing or dashboard component structure.** The migrated UI will need a small feature-oriented structure and accessible loading, empty, error, and responsive states without introducing unnecessary infrastructure.
6. **Preview builds use shared DEV browser configuration.** Schema and data changes must reach DEV before preview code that depends on them, while Production migrations must remain reviewed and deliberate.
7. **The source application is absent from this repository.** Its code, screens, data model, permissions, scheduled jobs, integrations, usage volumes, and acceptance examples cannot be assessed yet. Exact parity, effort, and security risk remain unknown.
8. **Worker runtime needs remain undefined.** If MIG-02 identifies a need for Worker runtime code, review its security boundary and confirm the intended compatibility date before implementation; do not add a Worker merely to reproduce the Apps Script shape.

The migration should preserve the current $0 operating-cost target by using the existing stack and available free tiers. Actual usage must be estimated before promising that free-tier limits will remain sufficient.

## Gaps

The following information or implementation is missing and should not be guessed:

- Google Apps Script source and deployment manifest;
- screenshots and a list of user journeys for the existing dashboard;
- spreadsheet/table inventory, sample sanitized data, formulas, validation, and data ownership;
- user list, roles, permissions, sign-in expectations, and offboarding process;
- integrations, triggers, email/notification behavior, exports, and scheduled work;
- non-functional expectations such as browser support, accessibility level, record volume, performance, retention, recovery, and audit needs;
- confirmed DEV and PROD Supabase project configuration, schema, RLS, backups, and region;
- confirmed Cloudflare build hooks, preview URL/access policy, traffic behavior, and Production release ownership;
- confirmed GitHub branch protection and required-review settings; and
- a migration parity checklist and owner-approved success criteria.

## Recommended scope for MIG-02

MIG-02 should be a requirements and source-inventory phase, not a broad implementation. Recommended deliverables are:

1. Obtain and version an owner-approved inventory of the current Apps Script files, manifest, HTML/templates, spreadsheet tabs/columns/formulas, triggers, external integrations, and sanitized representative records. Do not commit secrets or personal data.
2. Document each current user type and end-to-end workflow with screenshots or wireframes, including errors, empty states, exports, notifications, and administrative tasks.
3. Produce a feature-parity matrix that labels each behavior as migrate, replace, defer, or retire, with an owner decision for every non-parity choice.
4. Draft—but do not deploy—a proposed Supabase data model, authentication approach, roles, RLS policy matrix, retention/deletion rules, and DEV-first migration sequence.
5. Map every Apps Script server capability to browser-side Supabase access, a database function, an Edge Function, or an explicitly deferred capability. Include the security reason for anything requiring server-side execution.
6. Define measurable acceptance criteria, accessibility expectations, test coverage, rollout/rollback steps, and a staged migration plan.
7. Verify external GitHub, Cloudflare, and Supabase DEV settings with the owner without copying credentials into documentation or chat.
8. Confirm expected user and data volumes against free-tier limits. Escalate before selecting any paid service; the planned cost remains **$0**.

Owner action is required for MIG-02 to provide access to the existing Apps Script project and sanitized data/structure, identify users and roles, confirm which behaviors must be retained, and verify the external DEV service settings. No Production access or change is required for this discovery work.
