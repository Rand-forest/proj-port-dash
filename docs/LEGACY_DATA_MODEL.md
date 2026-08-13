# MIG-02 Legacy Data Model Baseline

## Migration task boundaries

- **Objective:** record the Google Sheets data model actually consumed and written by the legacy Apps Script dashboard before designing a replacement.
- **In scope:** `legacy /Code.gs`, `legacy /Index.html`, the seven worksheets below, their positional fields, relationships, defaults, conversions, and CRUD behavior.
- **Out of scope:** a Supabase schema, migrations, constraints, RLS, authentication/authorization design, data cleanup, and changes to legacy files.
- **Acceptance criteria:** every used worksheet and field is recorded, dataset relationships and operations are mapped, and unclear or inconsistent behavior is explicitly identified.

> The repository directory is literally named `legacy ` (with a trailing space). This document uses the logical names `legacy/Code.gs` and `legacy/Index.html` used by the migration brief. Sheet headers are not validated by the code; column meanings below come from zero-based positional reads/writes. Row 1 is always treated as a header when reading.

## Dataset overview and relationships

```text
Projects (id)
  |--< Activities (projectId) --< Comments (activityId)
  |--< RaidLog (projectId) ----< RaidComments (raidId)
  `--< Tasks (projectId)

ActionLog is independent; target names are descriptive text, not stored foreign keys.
```

- `Projects` is the parent. During reads, child rows whose `projectId` does not match a loaded project are silently omitted from the returned dashboard.
- `Comments` attach only to an activity that was itself attached to a loaded project. `RaidComments` behave equivalently for RAID items.
- Relationships are application conventions only. Sheets provide no foreign keys, cascade rules, uniqueness checks, or referential integrity.
- Deleting a project does **not** delete its activities, tasks, RAID items, or comments despite the audit text saying “Deleted project and associated data.” They remain as orphan Sheet rows and disappear only from assembled reads.
- Deleting an activity or RAID item does **not** delete its comments. There is no comment update or delete operation.

## `Projects`

| Column | Runtime field | Read behavior/default | Write behavior |
|---:|---|---|---|
| A (0) | `id` | Required to load; converted to string; blank rows skipped | Caller-supplied, normally `p${Date.now()}` |
| B (1) | `name` | `Unnamed Project` when falsey | `New Project` when falsey |
| C (2) | `sponsor` | Empty string | Empty string |
| D (3) | `manager` | Empty string | Empty string |
| E (4) | `techLead` | Empty string | Empty string |
| F (5) | `teamMembers` | Empty string | Empty string |
| G (6) | `objective` | Empty string | Empty string |
| H (7) | `scope` | Empty string | Empty string |
| I (8) | `budget` | `$0` | `$0` |
| J (9) | `actualSpend` | `$0` | `$0` |
| K (10) | `overallStatus` | `Not Started` | `Not Started` |
| L (11) | `department` | `Infra & Ops` | `Infra & Ops` |
| M (12) | `projectType` | Empty string | Empty string |

Read assembly adds `activities`, `raidItems`, and `tasks` arrays; those are not Project columns and are removed before frontend writes.

## `Activities`

| Column | Runtime field | Read behavior/default | Write behavior |
|---:|---|---|---|
| A (0) | `id` | Required; string; blank rows skipped | Caller-supplied, normally `a${Date.now()}` |
| B (1) | `projectId` | String; must match a loaded Project to be returned | Active project ID |
| C (2) | `name` | Direct value; no fallback | Direct value |
| D (3) | `startYear` | Number or `2024` when zero/invalid/blank | Calculated from modal start date |
| E (4) | `startMonth` | Number or `0`; fractional month represents day/30 | Calculated as month index + day/30 |
| F (5) | `duration` | Number or `1`; values of zero default to 1 | End month fraction minus start month fraction; minimum `0.1` |
| G (6) | `status` | `Not Started` | Direct value |
| H (7) | `isMilestone` | True only for boolean `true` or string `TRUE` | Boolean |
| I (8) | `category` | `Execution` | Direct value |
| J (9) | `level` | Number or `0` | Numeric select value |

Read assembly adds `comments`. The frontend removes it before writes.

## `RaidLog`

| Column | Runtime field | Read behavior/default | Write behavior |
|---:|---|---|---|
| A (0) | `id` | Required; string; blank rows skipped | Caller-supplied, normally `r${Date.now()}` |
| B (1) | `projectId` | String; must match a loaded Project | Active project ID |
| C (2) | `type` | `Risk` | Direct value |
| D (3) | `description` | Empty string | Direct value |
| E (4) | `owner` | Empty string | Direct value |
| F (5) | `status` | `Open` | Direct value |
| G (6) | `startDate` | If truthy, converted through `new Date(value).toISOString()`; otherwise empty | `Date` object or empty string |
| H (7) | `endDate` | Same as start date | `Date` object or empty string |

Read assembly adds `comments`; it is removed before writes.

## `Tasks`

| Column | Runtime field | Read behavior/default | Write behavior |
|---:|---|---|---|
| A (0) | `id` | Required; string; blank rows skipped | Caller-supplied, normally `t${Date.now()}` |
| B (1) | `projectId` | String; must match a loaded Project | Active project ID |
| C (2) | `date` | Truthy value converted to ISO string; otherwise empty | `Date` object or empty string |
| D (3) | `name` | Empty string | Direct value |
| E (4) | `details` | Empty string | Direct value |
| F (5) | `status` | `Pending` | Direct value |

The server silently returns without writing or logging when the `Tasks` sheet is absent.

## `Comments`

| Column | Runtime field | Read behavior | Write behavior |
|---:|---|---|---|
| A (0) | `id` | Required; string; blank rows skipped | `c${Date.now()}` |
| B (1) | `activityId` | String; attaches to a loaded activity | Caller-provided activity ID |
| C (2) | `timestamp` | Direct Sheet value | ISO timestamp string |
| D (3) | `userEmail` | Direct Sheet value | Active-user email or `Unknown User` |
| E (4) | `commentText` | Direct Sheet value | Trimmed by frontend before call |

The server assumes this sheet exists. Comments support create/read only.

## `RaidComments`

| Column | Runtime field | Read behavior | Write behavior |
|---:|---|---|---|
| A (0) | `id` | Required; string; blank rows skipped | `rc${Date.now()}` |
| B (1) | `raidId` | String; attaches to a loaded RAID item | Caller-provided RAID ID |
| C (2) | `timestamp` | Direct Sheet value | ISO timestamp string |
| D (3) | `userEmail` | Direct Sheet value | Active-user email or `Unknown User` |
| E (4) | `commentText` | Direct Sheet value | Trimmed by frontend before call |

Unlike other sheets, `addRaidComment` creates this sheet if missing and adds `ID`, `RaidID`, `Timestamp`, `UserEmail`, `CommentText` headers. Comments support create/read only.

## `ActionLog`

| Column | Runtime field | Behavior |
|---:|---|---|
| A (0) | `timestamp` | ISO string created when an action is logged |
| B (1) | `email` | Active-user email or `Unknown User` |
| C (2) | `actionType` | `CREATE`, `UPDATE`, `DELETE`, or `COMMENT` |
| D (3) | `targetName` | Project/activity name or descriptive task/RAID/comment label |
| E (4) | `details` | Fixed descriptive text, or empty string when caller omits details |

`getLogs` skips the first row and reverses remaining Sheet order, assuming append order is chronological. If the sheet is absent or has no data rows it returns `[]`. Logging silently does nothing if the sheet is absent.

## CRUD inventory

| Dataset | Create | Read | Update | Delete |
|---|---|---|---|---|
| Projects | `upsertProject` append | `getDashboardData` | `upsertProject` whole-row overwrite | `deleteProject` first matching row |
| Activities | `upsertActivity` append | `getDashboardData` | `upsertActivity` whole-row overwrite | `deleteActivity` first matching row |
| RaidLog | `upsertRaidItem` append | `getDashboardData` | `upsertRaidItem` whole-row overwrite | `deleteRaidItem` first matching row |
| Tasks | `upsertTask` append | `getDashboardData` | `upsertTask` whole-row overwrite | `deleteTask` first matching row |
| Comments | `addComment` append | `getDashboardData` | None | None |
| RaidComments | `addRaidComment` append | `getDashboardData` | None | None |
| ActionLog | `logAction` append (indirect) | `getLogs` | None | None |

All upserts select the first matching ID. They do not enforce unique IDs, validate payloads, return saved rows, or report “not found.” All writes clear the shared dashboard cache only after reaching their normal completion path.

## Enumerated and fixed values

| Domain | Values implemented by the UI |
|---|---|
| Project/activity status | `Not Started`, `On Track`, `At Risk`, `Overdue`, `Completed` |
| Project type | empty/unassigned, `Key Project`, `BAU Project` |
| RAID type | `Risk`, `Assumption`, `Issue`, `Dependency` |
| RAID status | `Open`, `Mitigated`, `Closed` |
| Task status | `Pending`, `In Progress`, `Blocked`, `Completed` |
| Department | `Infra & Ops`, `Corp Systems`, `Cyber Security`, `Digital Workspace`; dashboard filter also has `ALL` |
| Activity category | `Initiation`, `Planning`, `Execution`, `Monitoring/Testing`, `Closing` |
| WBS level | `0` Phase/Group, `1` Sub-task, `2` Detail Task |
| RAID filter | `ALL` plus all four RAID types |
| Task time view | `WEEK`, `MONTH` |
| Gantt month | `Jan` through `Dec` |
| Gantt year | `2024` through `2029` |
| Audit action | `CREATE`, `UPDATE`, `DELETE`, `COMMENT` |

The backend does not enforce these values; arbitrary Sheet or caller values can exist and may receive fallback styling.

## Data-model questions for later owner review

1. Should Project deletion cascade to children, be blocked, or remain non-cascading? Current audit text conflicts with actual behavior.
2. Are IDs guaranteed unique, and must legacy timestamp IDs be preserved during import?
3. Are budget and actual spend deliberately formatted free-text values rather than currency amounts?
4. Is the approximate `day / 30` fractional-month activity representation authoritative, or should exact dates become authoritative later?
5. Should comments remain immutable and undeletable?
6. Should orphan and duplicate rows be imported, repaired, or reported for owner review?
7. Which defaults are business rules versus defensive display fallbacks (notably Activity read year `2024` versus UI fallback year `2026`)?
8. Is ActionLog intended to be a durable audit record? It currently has no stable target ID, tamper controls, or guaranteed write.
9. Is on-demand creation of only `RaidComments` intentional, while missing other sheets fail or silently no-op?
