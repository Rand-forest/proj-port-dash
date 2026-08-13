# MIG-04 Supabase Schema

## Objective and boundaries

**Objective:** provide a repeatable local/DEV database foundation for the portfolio dashboard. **In scope:** tables, integrity rules, indexes, timestamps, sanitized fixtures, RLS, RPC writes, and audit transactions. **Out of scope:** Production deployment or data, login screens, frontend wiring, role assignment UI, permanent purge, FX conversion, and department-specific access. **Acceptance criteria:** an empty local Supabase database can apply the migration and tests; authenticated active users can read only active portfolio records; authorized writes use audited RPCs.

This is a **HIGH-risk** foundation because later deployment would control confidential reads and trusted writes. The files in this change do not connect to or modify Production.

## Records and relationships

- `user_profiles` links one trusted profile to `auth.users`. Its single role is `viewer`, `editor`, `auditor`, or `administrator`, and inactive profiles have no application access. A single role is sufficient now: Administrator combines editor and audit capability; Auditor intentionally does not imply Editor.
- `projects` owns `activities`, `tasks`, and `raid_items`; activities and RAID items own their respective immutable comments.
- New primary keys are generated UUIDs. Nullable `legacy_id` columns preserve source identity and partial unique indexes prevent duplicate imported IDs.
- Project `sort_order` is required and unique. Imports preserve source row order; the create RPC locks allocation and chooses `max(sort_order) + 1` (or zero).
- Business rows have `deleted_at`; archive RPCs set it without removing descendants or comments. RLS also hides descendants of an archived project.
- `updated_at` is maintained by database triggers. Immutable comments and audit events have no `updated_at`.

## Money and Gantt behavior

Each project requires an uppercase three-letter currency code. There is deliberately no currency default, fixed currency list, portfolio FX conversion, or cross-currency total. Amounts are non-negative `numeric(19,2)` values.

Activity dates are canonical and must be ordered. Imported rows can additionally preserve all three fractional legacy fields (`legacy_start_year`, `legacy_start_month`, and `legacy_duration`). They must be all present and valid or all absent. Exact dates are not claimed to reproduce the old fractional month positioning, and no new Gantt algorithm is introduced.

## Deletion and history

Ordinary deletion means archive. Projects, activities, tasks, and RAID items remain stored with their descendants. Comments remain stored and immutable. Audit rows have snapshot identities and no foreign key to business records, so future restricted removal cannot silently erase history. Permanent purge and audit expiry remain unimplemented.

## Local files

- `supabase/config.toml` configures the standard local Supabase services and seed.
- `supabase/migrations/202608130001_mig04_foundation.sql` builds the complete foundation from zero.
- `supabase/seed.sql` contains only fictional `.invalid` identities and representative portfolio cases.
- `supabase/tests/mig04_foundation_test.sql` uses pgTAP to exercise access, RPC, audit, ordering, identity, and immutability controls.

The seed demonstrates SGD, USD, and EUR without comparing or converting them; every project type/status grouping; all RAID types; same-month, cross-month, cross-year, and exact-boundary Gantt coordinates; historical null identities; and archived-parent storage.
