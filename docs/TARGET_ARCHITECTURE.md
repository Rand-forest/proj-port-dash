# MIG-03 Target Architecture

## Task definition

- **Objective:** define the smallest secure target architecture and typed data boundary while preserving the legacy dashboard's visible behavior.
- **In scope:** MIG-01/MIG-02 findings, target operation boundaries, identity assumptions, audit generation, deletion/comment recommendations, and the next migration scope.
- **Out of scope:** database migrations or remote changes, CRUD, authentication, RLS, Worker runtime, frontend migration, data import, and Production changes.
- **Acceptance criteria:** each operation has one recommended access pattern and security reason; high-impact choices are called out for approval; the design is represented by strict TypeScript types and sanitized fixtures.
- **Impact:** repository documentation/types/tests only; no database, authentication, deployment, or cost impact.

## Recommended shape

```text
React/Vite browser
  |-- authenticated Supabase client --> RLS-protected read tables/views
  `-- authenticated Supabase RPC ------> validating mutation functions
                                            |-- change relational rows
                                            `-- append audit row atomically

Cloudflare Workers Static Assets serves the SPA only.
```

This keeps the existing stack and approximately $0/month target. A Cloudflare API is not justified: Supabase already verifies sessions, applies RLS, and can run transactional database functions. Ordinary dashboard reads remain direct. Mutations use narrow RPC functions because the business change and trusted audit entry must succeed or fail together. This does **not** grant implementation approval; authentication, RLS, functions, and Production changes remain later, separately reviewed work.

## Operation decisions

| Operation category | Pattern | Reason |
| --- | --- | --- |
| Dashboard reads | **Direct Supabase + RLS** | Straight relational reads need no privileged secret. RLS must limit rows to authenticated viewers; browser code can assemble the normalized response or use a read view. |
| Project creates/updates/deletes | **Database function/RPC** | Validate enums/money, enforce deletion policy, and write an audit event in one transaction using authenticated identity. |
| Activity creates/updates/deletes | **Database function/RPC** | Validate exact dates/order, preserve parent integrity, cascade comments only under approved deletion policy, and audit atomically. |
| Task creates/updates/deletes | **Database function/RPC** | Validate parent/date/status and generate non-optional trusted audit events atomically. |
| RAID creates/updates/deletes | **Database function/RPC** | Validate type/status/date order, apply approved comment cascade, and audit atomically. |
| Activity comments | **Database function/RPC** | Derive author from the authenticated database context, reject blank text, and atomically create the comment and audit event. |
| RAID comments | **Database function/RPC** | Same trusted author and atomic-audit requirements as activity comments. |
| Audit-log reads | **Direct Supabase + RLS** | A read-only query is sufficient; RLS must restrict this sensitive, cross-user history to an approved role. |
| Audit-log writes | **Database function/RPC** | Only controlled mutation functions (or triggers they invoke) may append logs; direct browser inserts/updates/deletes must be denied. |

Gantt positioning, task week/month grouping, filters, Key Project ordering, print/PDF export, labels, and formatting are **browser-only logic**. They do not need an API. A read view or RPC may be reconsidered only if measured volume makes the normalized direct reads inadequate.

## Audit strategy comparison

| Option | Assessment |
| --- | --- |
| Browser insert | Reject. A client can omit the event or forge actor, target, time, and details. RLS cannot make browser-authored descriptive values trustworthy. |
| Database trigger/function | **Recommend.** `auth.uid()` supplies the signed-in subject and a transaction can couple mutation and audit insert. Purpose-built functions can capture action, stable target ID/label, and safe changed-field details. Audit rows must be append-only to clients. |
| Cloudflare Worker/API | Secure if it validates the Supabase token and owns credentials, but adds runtime code, secret management, failure modes, and maintenance without a present requirement. It still needs a database transaction/function for reliable atomicity. |

Prefer narrow `security invoker` database functions where possible. If a `security definer` function is unavoidable, it requires explicit locked `search_path`, revoked public execution, minimal grants, input validation, and security review. Triggers may be an internal backstop, but the public mutation contract remains RPC so meaningful action details can be supplied safely. Audit retention and viewer roles require owner approval.

## Authentication and authorization assumptions

Future authentication must provide:

- a stable signed-in subject (`auth.users.id`/`auth.uid()`) for authorship and audit actors;
- a verified email for display and a stored email snapshot so historical comments/logs remain understandable after an address changes;
- session expiry, sign-out, and offboarding behavior; and
- an initially small role claim/profile, recommended as `viewer` and `editor`, plus an `auditor` capability or role for audit-log access.

Email is a display/snapshot attribute, not a primary key or authorization proof. The browser must never send a trusted `authorUserId`, `actorUserId`, email, timestamp, or audit event. RPC/functions derive identity and server time. RLS/backend controls must eventually enforce authenticated reads, editor-only mutations, parent visibility, comment authorship, denied direct audit mutations, audit viewer access, and role administration. Hiding a UI control is not authorization.

The exact user population, whether department-scoped access is required, who may edit/delete, and who may view logs remain owner decisions. Until approved and tested in DEV, no write feature should ship.

## Integrity and behavior decisions

### IDs

New records use database-generated UUIDs. They avoid timestamp collisions, expose no creation timing, and work across concurrent/offline clients. Every imported business table also has nullable `legacy_id` text; migrated nonblank legacy IDs are preserved there, not reused as primary keys. Import tooling must build old-to-new maps for foreign keys and report blanks/duplicates/orphans. It must not silently select the first duplicate or discard an orphan. Owner approval is needed for the resulting exception report's repair/rejection choices, not for the UUID recommendation.

### Activity dates and Gantt parity

Canonical activities use inclusive `start_date` and `end_date` calendar dates, with `end_date >= start_date`. Exact dates replace lossy `startYear`, fractional `startMonth`, and fractional `duration`. The Gantt remains visually equivalent during parity migration: the UI computes fractional positions at render time using the legacy `month + day/30` convention and derives the bar duration from the exact endpoints. Regression cases must cover same-month, cross-month, and cross-year bars before changing that approximation. This improves stored truth without silently modernizing visible layout. A later proportional-calendar-day display would be a separate owner-approved enhancement.

Import must reproduce the legacy reverse conversion (`round(fraction * 30)`, clamped to a valid calendar date), retain the original legacy values in an import report/staging data, and flag impossible/ambiguous values. The activity UI's fixed 2024–2029 selector remains a parity requirement pending the existing year-horizon owner decision.

### Money

The application supports multiple currencies at project level. Every project has one required three-letter ISO 4217 `currency_code`; its non-negative PostgreSQL `numeric(19,2)` `budget_amount` and `actual_spend_amount` are interpreted only in that currency. The browser contract uses exact decimal strings because JavaScript binary floating point is not authoritative for money, and the UI formats each amount using its project's currency code.

Migration must parse the amount and identify the currency as separate steps. It must assign a currency only when the source value or an owner-approved mapping identifies it unambiguously. A generic symbol such as `$` must never be guessed; ambiguous and unparseable values belong in the migration exception report for owner review.

No foreign-exchange (FX) conversion is part of the initial migration. Values in different currencies are not directly comparable and must not be added together. If portfolio totals are required, the initial UI must group totals by `currency_code`; a converted single-currency total would require a separately approved FX-conversion feature, rate source, rate-date policy, rounding rules, and cost/security review.

### Deletion and comments

Recommended behavior, subject to owner approval before writes:

- deleting a **project** requires confirmation and cascades to its activities, tasks, RAID items, and both kinds of comments in one transaction;
- deleting an **activity** cascades to its activity comments;
- deleting a **RAID item** cascades to its RAID comments;
- tasks have no children; and
- audit logs never cascade and retain entity ID/label snapshots without foreign keys.

This prevents the hidden orphans created by the legacy application. Comments remain create/read only: no editing or individual deletion, matching legacy behavior and protecting discussion integrity. They are deleted with their parent under the recommended cascade, while the audit log retains who deleted the parent and when but not full comment text. If regulatory retention requires comment content after parent deletion, use soft deletion/retention instead; that need is not evidenced and is an owner decision.

## Security and operational guardrails

- Use only the publishable browser key through `src/lib/supabase.ts`; never expose a service-role key or treat a `VITE_` value as secret.
- Maintain separate DEV/PROD projects. Develop migrations, RLS, RPC, and tests in DEV first; Production execution requires separate approval.
- Apply least privilege: table writes should not be exposed when RPC is the supported mutation path, and audit rows are immutable to browser roles.
- Validate text length, enums, date order, money bounds, parent visibility, and not-found/conflict outcomes on the trusted boundary.
- Return saved records and explicit errors; replace legacy optimistic fire-and-forget behavior with visible pending/failure and rollback/reload behavior when writes are implemented.

## Recommended smallest safe MIG-04

MIG-04 should create **local, version-controlled Supabase schema and RLS/RPC design artifacts plus automated database tests**, using a local or dedicated DEV workflow only after owner approval of the decisions in `OWNER_DECISIONS.md`. It should cover tables, constraints, indexes, timestamps, roles/policy matrix, transactional mutation/audit function specifications, and sanitized seed mapping. It should not migrate the frontend, import legacy data, deploy Production, or enable general CRUD. If a local database tool is unavailable, MIG-04 can remain migration/test-file authoring and review; no remote fallback should be used.

No Worker/API should be added in MIG-04. Authentication UI should be a separate small phase after the identity provider and access roles are approved.
