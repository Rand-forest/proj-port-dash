# MIG-03 Target Data Model

## Status and boundaries

This is a proposed relational contract, **not SQL and not a deployed schema**. No database was contacted. It resolves MIG-02's structural ambiguities while keeping high-impact deletion, retention, access, and financial interpretations subject to the owner decisions.

- **Objective:** define normalized target records, constraints, relationships, indexes, and migration mappings for future reviewed migrations.
- **In scope:** seven target tables and their typed application representation in `src/types/portfolio.ts`.
- **Out of scope:** SQL migrations, remote/Production changes, authentication/RLS implementation, CRUD, import, and UI wiring.
- **Acceptance criteria:** every proposed table identifies columns, types, keys, null/default behavior, timestamps, indexes, and relationship actions.

## Shared conventions

- Primary keys are database-generated `uuid` values (`gen_random_uuid()` in a future migration). Imported source IDs go in nullable `legacy_id text`; partial unique indexes on non-null legacy IDs prevent duplicates after exceptions are resolved.
- Business records use `created_at timestamptz NOT NULL DEFAULT now()` and `updated_at timestamptz NOT NULL DEFAULT now()`. A future trusted trigger maintains `updated_at`; clients do not set it.
- Calendar-only fields use PostgreSQL `date`; instants use `timestamptz`. Database names are snake_case; the application adapter exposes camelCase.
- Required user-entered text is trimmed and checked nonblank. Optional display fields use non-null empty text only where that preserves the current uncomplicated form contract.
- Enum-like values should initially be `text` plus named `CHECK` constraints. This makes reviewed additions easier than PostgreSQL enum alteration while still rejecting unexpected values.
- Foreign keys are immediate and validated. Parent visibility and mutation permissions still require future RLS/RPC tests.
- Money uses `numeric(19,2)` and the TypeScript boundary represents it as exact decimal text, never as floating-point authority.

## Relationship overview

```text
projects
  |--< activities --< activity_comments
  |--< raid_items --< raid_comments
  `--< tasks

audit_logs stores entity/actor snapshots without deleting with business rows
```

## `projects`

| Column | Type | Null/default | Key/constraint |
| --- | --- | --- | --- |
| `id` | `uuid` | NOT NULL, generated | PK |
| `legacy_id` | `text` | NULL | partial unique when non-null |
| `name` | `text` | NOT NULL | trimmed, nonblank |
| `sponsor` | `text` | NOT NULL DEFAULT `''` | length limit to be set from profiling |
| `manager` | `text` | NOT NULL DEFAULT `''` | display text, not an identity FK |
| `tech_lead` | `text` | NOT NULL DEFAULT `''` | display text |
| `team_members` | `text` | NOT NULL DEFAULT `''` | legacy free-text team list |
| `objective` | `text` | NOT NULL DEFAULT `''` | — |
| `scope` | `text` | NOT NULL DEFAULT `''` | — |
| `budget_amount` | `numeric(19,2)` | NOT NULL DEFAULT `0` | `>= 0` |
| `actual_spend_amount` | `numeric(19,2)` | NOT NULL DEFAULT `0` | `>= 0` |
| `currency_code` | `varchar(3)` | NOT NULL; no default | uppercase three-letter ISO 4217-style project currency |
| `overall_status` | `text` | NOT NULL DEFAULT `'Not Started'` | five project-status values |
| `department` | `text` | NOT NULL DEFAULT `'Infra & Ops'` | four legacy values initially |
| `project_type` | `text` | NOT NULL DEFAULT `'Unassigned'` | `Key Project`, `BAU Project`, `Unassigned` |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | — |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | maintained by trusted trigger |

Indexes: PK; partial unique `legacy_id`; `(department, project_type, created_at, id)` for dashboard filtering/stable ordering; `(overall_status)` only if profiling shows status filters justify it. Blank legacy project type maps explicitly to `Unassigned`, preserving its distinct non-Key/BAU display meaning without accepting empty database values.

Each project has exactly one required currency. Both financial amounts are denominated in that project's `currency_code`; no database default may silently assign a currency. Do not hard-code the full ISO currency list in a PostgreSQL `CHECK`: that list and the currencies the application supports can evolve. Validate the uppercase three-letter shape at the database boundary and use a maintainable application-level supported-currency list (or another reviewed, extensible reference mechanism) for recognized codes. Different currencies must never be summed as directly comparable amounts; portfolio totals are grouped by currency unless a separate FX feature is approved.

## `activities`

| Column | Type | Null/default | Key/constraint |
| --- | --- | --- | --- |
| `id` | `uuid` | NOT NULL, generated | PK |
| `legacy_id` | `text` | NULL | partial unique when non-null |
| `project_id` | `uuid` | NOT NULL | FK → `projects.id` ON DELETE CASCADE |
| `name` | `text` | NOT NULL | trimmed, nonblank |
| `start_date` | `date` | NOT NULL | exact canonical start |
| `end_date` | `date` | NOT NULL | `end_date >= start_date` |
| `status` | `text` | NOT NULL DEFAULT `'Not Started'` | five project-status values |
| `is_milestone` | `boolean` | NOT NULL DEFAULT `false` | retains overview visibility behavior |
| `category` | `text` | NOT NULL DEFAULT `'Execution'` | five legacy categories |
| `level` | `smallint` | NOT NULL DEFAULT `0` | `IN (0,1,2)` |
| `sort_order` | `integer` | NOT NULL | `>= 0`; assigned during import/create |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | shared timestamp rules |

Indexes: PK; partial unique `legacy_id`; `(project_id, sort_order, id)` for WBS display; `(project_id, is_milestone, start_date)` for overview Gantt. The cascade is recommended but owner approval is required before migration. `is_milestone` deliberately retains the legacy field/visible behavior; renaming or redefining it is out of scope.

## `raid_items`

| Column | Type | Null/default | Key/constraint |
| --- | --- | --- | --- |
| `id` | `uuid` | NOT NULL, generated | PK |
| `legacy_id` | `text` | NULL | partial unique when non-null |
| `project_id` | `uuid` | NOT NULL | FK → `projects.id` ON DELETE CASCADE |
| `type` | `text` | NOT NULL DEFAULT `'Risk'` | Risk/Assumption/Issue/Dependency |
| `description` | `text` | NOT NULL | trimmed, nonblank |
| `owner` | `text` | NOT NULL DEFAULT `''` | legacy display owner |
| `status` | `text` | NOT NULL DEFAULT `'Open'` | Open/Mitigated/Closed |
| `start_date` | `date` | NULL | — |
| `end_date` | `date` | NULL | end requires start; end >= start |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | shared timestamp rules |

Indexes: PK; partial unique `legacy_id`; `(project_id, type, created_at, id)` for project/type filtering; optional `(project_id, status)` only after query profiling. Project cascade requires owner approval.

## `tasks`

| Column | Type | Null/default | Key/constraint |
| --- | --- | --- | --- |
| `id` | `uuid` | NOT NULL, generated | PK |
| `legacy_id` | `text` | NULL | partial unique when non-null |
| `project_id` | `uuid` | NOT NULL | FK → `projects.id` ON DELETE CASCADE |
| `date` | `date` | NOT NULL | calendar grouping date |
| `name` | `text` | NOT NULL | trimmed, nonblank |
| `details` | `text` | NOT NULL DEFAULT `''` | — |
| `status` | `text` | NOT NULL DEFAULT `'Pending'` | four task-status values |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | shared timestamp rules |

Indexes: PK; partial unique `legacy_id`; `(project_id, date, id)` supports week/month grouping. Project cascade requires owner approval.

## `activity_comments`

| Column | Type | Null/default | Key/constraint |
| --- | --- | --- | --- |
| `id` | `uuid` | NOT NULL, generated | PK |
| `legacy_id` | `text` | NULL | partial unique when non-null |
| `activity_id` | `uuid` | NOT NULL | FK → `activities.id` ON DELETE CASCADE |
| `author_user_id` | `uuid` | NOT NULL | logical FK to authenticated user; exact auth/profile FK decided with auth design |
| `author_email_snapshot` | `text` | NOT NULL | server-derived verified email snapshot |
| `comment_text` | `text` | NOT NULL | trimmed, nonblank; future maximum length |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | server time/order |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | equal to created time while immutable |

Indexes: PK; partial unique `legacy_id`; `(activity_id, created_at, id)` for stable discussion order; `(author_user_id)` only if an approved administrative query needs it. No update or individual delete RPC is proposed. Parent cascade and retention require owner approval.

## `raid_comments`

The same comment contract applies, replacing `activity_id` with `raid_item_id uuid NOT NULL REFERENCES raid_items(id) ON DELETE CASCADE`. Index `(raid_item_id, created_at, id)` supports stable discussion order. Other keys, nullability, identity derivation, immutability, timestamps, and approval requirements match `activity_comments`.

## `audit_logs`

| Column | Type | Null/default | Key/constraint |
| --- | --- | --- | --- |
| `id` | `uuid` | NOT NULL, generated | PK |
| `occurred_at` | `timestamptz` | NOT NULL DEFAULT `now()` | server-generated |
| `actor_user_id` | `uuid` | NOT NULL | authenticated subject captured by function |
| `actor_email_snapshot` | `text` | NOT NULL | server-derived verified email |
| `action` | `text` | NOT NULL | CREATE/UPDATE/DELETE/COMMENT |
| `entity_type` | `text` | NOT NULL | project/activity/task/raid_item/activity_comment/raid_comment |
| `entity_id` | `uuid` | NOT NULL | snapshot, deliberately no FK |
| `entity_label` | `text` | NOT NULL | non-sensitive display snapshot |
| `details` | `text` | NULL | safe structured summary; no secrets/full payloads |

Audit logs are append-only and therefore have no `updated_at`. There is no FK to a business row or auth row: deleting/offboarding must not erase history. Indexes: PK; `(occurred_at DESC, id DESC)` for the viewer; `(entity_type, entity_id, occurred_at DESC)` for investigation; `(actor_user_id, occurred_at DESC)` only if required. Retention may later require time partitioning, but current volume does not justify it. Direct browser insert/update/delete is denied; restricted direct reads use RLS.

## Deletion matrix

| Deleted record | Proposed database action | Preserved history |
| --- | --- | --- |
| Project | CASCADE activities, tasks, RAID items; their comment cascades follow | Audit rows remain with snapshots |
| Activity | CASCADE activity comments | Audit rows remain |
| RAID item | CASCADE RAID comments | Audit rows remain |
| Task | No descendants | Audit rows remain |
| User/auth record | RESTRICT or retain a minimal profile reference until auth design resolves it; never cascade audit/comments | Email snapshots preserve display history |

The first three actions replace unsafe legacy orphaning and require owner approval. Destructive RPC must confirm authorization, return an explicit outcome, and generate the deletion audit event in the same transaction.

## Legacy conversion rules

1. Profile all source rows without changing them. Report blank/duplicate IDs, orphans, invalid enum values, malformed dates, and ambiguous money.
2. Generate UUIDs and preserve each accepted old ID in `legacy_id`; build mapping tables in import tooling to translate child references.
3. Convert activity fractions into exact dates using the legacy reverse rule and flag invalid calendar outcomes. Preserve raw conversion inputs in an import report, not permanent application columns.
4. Parse a legacy financial amount and identify its currency as separate operations. Recognized examples map as follows:

   | Legacy value | Parsed amount | Identified currency | Result |
   | --- | ---: | --- | --- |
   | `S$495K` | `495000.00` | `SGD` | eligible for import |
   | `SGD 120K` | `120000.00` | `SGD` | eligible for import |
   | `US$75K` | `75000.00` | `USD` | eligible for import |
   | `USD 50,000` | `50000.00` | `USD` | eligible for import |
   | `€30K` | `30000.00` | `EUR` | eligible for import |
   | `$495K` | amount may be `495000.00` | ambiguous | **OWNER REVIEW REQUIRED** |
   | `TBC` | unparseable | unidentified | **OWNER REVIEW REQUIRED** |

   A currency is assigned only when the source value or an owner-approved mapping identifies it unambiguously. Never infer one from a generic symbol. Exception reporting must preserve the original source text, parsed amount when available, and reason for review. No FX conversion occurs during initial migration.
5. Preserve source order using activity `sort_order`; stable IDs break ties elsewhere.
6. Map blank project type to `Unassigned`. Do not invent replacements for arbitrary enum values without owner disposition.
7. Import comments as immutable records with mapped parents and preserved timestamps/author snapshots. Unknown identities require an approved mapping policy.
8. Do not treat the incomplete legacy ActionLog as a full change history. If imported, label it as legacy history and assign stable target IDs without implying guarantees it never had.

## Application contract mapping

`src/types/portfolio.ts` contains the normalized camelCase application types and allowed values. `src/fixtures/portfolio.ts` uses fictional `.invalid` identities and deterministic UUID-shaped IDs to exercise all departments, project types/statuses, all RAID types, comments, tasks, milestones, WBS levels, and a cross-year Gantt activity. These files are not database-generated types and must not be mistaken for an RLS/schema guarantee; a later adapter should map generated Supabase row types into this application contract.
