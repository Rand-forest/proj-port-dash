# MIG-02 Feature Parity Matrix

## Usage

This matrix is the migration checklist for behavior found in the legacy source. `MIGRATE` means preserve the observed behavior unless an owner-approved later decision changes it. `REVIEW` flags ambiguity, risk, inconsistency, or a requirement decision. No feature is marked retire, replace, or defer.

| Feature | Legacy implementation | Target disposition | Migration phase | Acceptance criteria | Owner decision required? |
|---|---|---|---|---|---|
| Dashboard overview | Department-filtered projects with milestone Gantt | MIGRATE | UI migration | Same projects, status, milestone bars, navigation, and empty state are observable | No |
| Department filter | ALL plus four exact-match departments | MIGRATE | UI migration | Selecting each option immediately limits dashboard projects | No |
| Key Project priority | Key Projects sorted first and highlighted | MIGRATE | UI migration | Key Projects precede other types without changing within-group order | No |
| Project detail | Header, leadership, financial, objective/scope, activities, tasks, RAID | MIGRATE | UI migration | Selecting a project presents all legacy sections and data | No |
| Project create/edit | Optimistic create and whole-row field updates | REVIEW | Write migration | Approved fields/defaults persist with visible success/failure behavior | Yes — optimistic/error semantics |
| Project delete | Immediate, no confirmation, non-cascading despite log text | REVIEW | Write migration | Confirmed archive hides the project/descendants, preserves recovery and comments, and is audited accurately | No — archive approved |
| Project statuses | Five fixed values with colored styling | MIGRATE | Data contract/UI | All values render and can be selected exactly as baseline | No |
| Project types | Key Project, BAU Project, blank/unassigned | REVIEW | Data contract/UI | Approved handling of blank and fixed values is preserved | Yes — blank semantics |
| Team and department | Modal edits five Project fields | MIGRATE | Write migration | Values display and persist together | No |
| Financials | Budget and actual spend stored as strings | REVIEW | Data design | Exact amounts round-trip in each project's required currency; ambiguous legacy currencies are escalated, and totals do not combine currencies without approved FX conversion | Yes — import exceptions only; multi-currency approved in MIG-03A |
| Objective and scope | Editable text with empty display messages | MIGRATE | Write migration | Multiline content and fallbacks remain observable | No |
| Overview Gantt window | Select start/end month and fixed 2024–2029 year | REVIEW | UI migration | Approved year range and valid month constraints work | Yes — year horizon |
| Current-date line | Fractional position within selected current month/year | MIGRATE | UI migration | Line appears only in visible current period at equivalent position | No |
| Milestone overview | Only `isMilestone` activities shown | REVIEW | UI migration | Approved milestone/display meaning controls overview visibility | Yes — field semantics |
| Activity list/WBS | Category, level indentation, all activities, controls | MIGRATE | UI migration | Activities display in stored order with equivalent metadata | No |
| Activity create/edit/delete | Modal, optimistic writes, non-cascading delete | REVIEW | Write migration | Approved validation and recoverable archive behavior preserve associated comments | No — archive approved |
| Activity date calculations | Fractional months using day/30 and approximate reverse conversion | REVIEW | Data design | Exact dates provide calendar semantics while original legacy fractions reproduce month-boundary, same-month, cross-month, and cross-year Gantt positions during parity | Yes — proportional replacement only |
| Activity categories/WBS | Five categories and levels 0–2 | MIGRATE | Data contract/UI | Exact options and labels are available | No |
| Activity comments | Create/read chat; no update/delete | REVIEW | Comments migration | Immutable create/read behavior, nullable imported identity, author snapshot, parent archive association, and order are preserved | No — lifecycle approved |
| Task tracker | Last/current week or month split | MIGRATE | UI migration | Monday–Sunday and calendar-month grouping matches baseline | No |
| Task visibility | Hides tasks outside the two displayed periods | REVIEW | UI migration | Approved visibility policy is observable | Yes |
| Task CRUD/status | Date/name/details/status; inline status; optimistic writes | MIGRATE | Write migration | Create, edit, inline status, and delete persist reliably | No |
| RAID list/filter | Four types, All filter, timeline, owner, status | MIGRATE | UI migration | Filtering and displayed fields/status styling match baseline | No |
| RAID CRUD | Modal plus inline status and optimistic delete | MIGRATE | Write migration | Create/edit/status/delete persist with explicit outcomes | No |
| RAID comments | Create/read; RaidComments sheet auto-created; no edit/delete | REVIEW | Comments migration | Immutable lifecycle, nullable imported identity, author snapshot, and parent archive association are preserved | No — lifecycle approved |
| Initial loading | Spinner and Google Sheets sync text | MIGRATE | UI migration | A clear loading state remains until initial outcome | No |
| Initial load error | Generic failure page, console detail, no retry | REVIEW | UI migration | Owner-approved actionable error/retry behavior exists | Yes |
| Write loading/errors | No state or handlers; local state changes first | REVIEW | Write migration | Approved progress, rollback/retry, and error messaging are tested | Yes |
| Empty states | Dashboard, tasks, RAID, logs, comments, metadata fallbacks; none for Activities | REVIEW | UI migration | Approved empty copy exists for every section | Yes — Activities/log ambiguity |
| Active-user identity | Apps Script active-user email used for display, logs, comments | REVIEW | Identity design | Trusted signed-in identity and unavailable-email behavior are approved | Yes |
| Authorization | No source-level role/ownership/department checks | REVIEW | Security design | Owner approves roles and access before writes ship | Yes |
| Dashboard cache | Shared script cache, one key, 15-minute TTL, write invalidation | REVIEW | Data access design | Freshness and invalidation requirements are approved and tested | Yes |
| Action audit logging | Optional ActionLog append; fixed actions; no IDs/before-after | REVIEW | Audit design | Required events, identity, target IDs, retention, and access are approved | Yes |
| Logs viewer | Newest first table of all audit entries | REVIEW | UI/security migration | Approved viewers can see accurate entries with loading/error/empty states | Yes |
| Browser PDF/print | Native landscape print, contextual title, print hiding/break styles | MIGRATE | UI migration | Dashboard/detail print cleanly with contextual filename suggestion | No |
| Local mock fallback | Uses embedded data when Apps Script is absent | REVIEW | Development setup | Approved DEV-only fixtures cannot be mistaken for live persistence | Yes |
| External CDN assets | Browser loads React/Tailwind/Babel/icons/background image externally | REVIEW | Build migration | Asset strategy meets reliability, privacy, and $0 target | Yes |
| Sheet positional contract | Seven sheets read/written by column index | REVIEW | Data migration planning | Source data is profiled and mapped without assuming header correctness | Yes |
| Orphan/duplicate handling | Orphans omitted; first duplicate updated/deleted; duplicates still read | REVIEW | Data migration planning | Approved report/cleanup/import policy is documented before migration | Yes |

## Phase note

Phase labels are sequencing guidance, not final architecture decisions. Items requiring owner decisions must be resolved before their related write, security, or data migration is implemented.
