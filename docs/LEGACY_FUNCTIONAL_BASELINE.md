# MIG-02 Legacy Functional Baseline

## Task definition

- **Objective:** establish an authoritative record of what the Google Apps Script Project Portfolio Dashboard currently does before application migration begins.
- **In scope:** all behavior implemented in `legacy/Index.html` and `legacy/Code.gs`, including visible features, calls, identity, caching, audit logging, UI states, filters, calculations, comments, tasks, RAID, and printing.
- **Out of scope:** React migration work, Supabase schema/data, Cloudflare runtime/API work, authentication/authorization/RLS design, production changes, dependencies, and corrections to legacy behavior.
- **Acceptance criteria:** important legacy features and fixed values are inventoried; server interactions and Sheet data are cross-referenced in the companion documents; actual behaviors and uncertainties are recorded without assuming correctness.
- **Risk / impact:** LOW; documentation only. Database impact: none. Authentication/security impact: none. Cost impact: $0.

## Runtime baseline

- Apps Script `doGet` serves the single `Index` HTML file, sets the title to “SPH Media - Project Portfolio,” and allows framing from any origin via `ALLOWALL`.
- The page loads Tailwind, React 18, ReactDOM, Babel, and Font Awesome from public CDNs. JSX is compiled in the browser.
- The initial Apps Script read provides all Projects and nested children in one payload. Without `google.script.run`, the page uses two embedded mock projects after an artificial 800 ms delay.
- The interface is a dark, desktop-oriented single page with dashboard and project-detail views plus modal editors.

## User-visible feature inventory

### Global header

- SPH Media / Project Portfolio branding.
- Dashboard-only department pills: All, Infra & Ops, Corp Systems, Cyber Security, and Digital Workspace.
- **Export PDF** invokes browser print with print-specific landscape styles.
- **Logs** opens the Workspace Action Log.

### Executive dashboard

- Shows filtered projects with project name, inline overall-status selector, delete-on-hover control, and milestone bars.
- Sorts Key Projects before all other projects while preserving existing order within those groups.
- Highlights Key Projects with star and amber styling.
- Project name opens the detail view.
- Month start/end selectors constrain each other; fixed years 2024–2029 select the Gantt window.
- A dashed red “today” line is shown only when today falls in the selected year/month window.
- **Add New Project** immediately creates a local default project, sends a write, opens its detail, and begins title editing.

### Project detail and editing

- Back button returns to dashboard.
- Project name supports inline editing on blur or Enter; blank trimmed names are not saved.
- Project type and overall status are inline selectors.
- Team & Leadership displays/edits sponsor, project manager, tech lead, team members, and department.
- Financials displays/edits budget and actual-spend strings.
- Objective & Scope displays/edits multiline text with display fallbacks.

### Activities and Gantt

- Work Breakdown lists every activity with category, name, WBS indentation, edit/delete controls, comment count, and discussion access.
- Add/edit modal captures name, category, WBS level, start/end dates, status, and “Show on Dashboard (Milestone).”
- Dashboard shows only milestone activities; detail shows all activities.
- Bars are clipped to the visible month window. Hover tooltips show activity name, approximate start/end month/year, and status.
- Date conversion stores `startYear`, fractional `startMonth` (`month + day/30`), and fractional `duration`; non-positive duration becomes 0.1 month.
- Existing stored values are converted back to approximate dates using 30-day months.

### Action items / tasks

- Add/edit/delete tasks and change status inline.
- Fields are date, name, details, and status.
- Week view shows last week versus this week; weeks run Monday through Sunday.
- Month view shows last month versus this month.
- Only tasks in those two periods appear; older/future tasks outside both periods are hidden.
- Tasks sort ascending by date within each panel.

### RAID

- Shows type, description, start/end timeline, owner, status, edit/delete controls, comments, and comment count.
- Filters by All, Risk, Assumption, Issue, or Dependency.
- Add/edit modal captures type, status, dates, owner, and description.
- Status can also change inline. Closed/Mitigated selections are styled with reduced opacity and strikethrough.

### Activity and RAID discussions

- Separate modal entry points share one chat-like comments component.
- Shows author email, localized timestamp, comment text, and “You” when email equals `currentUser`.
- Empty discussion invites the user to start it; opening/updates scroll to the latest comment.
- Send button or Enter sends; Shift+Enter inserts a newline; whitespace-only messages are blocked.
- Comments are optimistic and append locally before persistence succeeds. No edit/delete function exists.

### Action log

- Displays timestamp, user, action, target, and details, newest Sheet row first.
- Opening the modal starts the fetch and initially displays “No logs available or fetching...”.
- There is no filter, pagination, export, refresh button, or explicit fetch error state.

## Filtering, sorting, and fixed options

The complete fixed-value inventory is in `LEGACY_DATA_MODEL.md`. Implemented filters/views are:

- Department exact-match filter, default `ALL`.
- RAID type exact-match filter, default `ALL`.
- Task time view `WEEK` (default) or `MONTH`.
- Gantt start month January (0), end month December (11), and current year by default; years are limited to 2024–2029.
- Dashboard Key Project priority sort. Activities and projects otherwise retain Sheet order; comments retain Sheet order; logs reverse it; visible task groups sort by date.

## Loading, error, and empty states

### Loading

- Initial load shows a spinner and “Syncing with Google Sheets...” until success or failure.
- Local fallback shows the same state for about 800 ms.
- No saving, deleting, commenting, or log-fetch spinner exists; controls remain optimistic/fire-and-forget.

### Errors

- Initial `getDashboardData` failure logs the error to the browser console and replaces content with an alert icon and “Failed to load data.”
- No retry action or detailed/user-safe cause is presented.
- Every write/delete/comment call and the logs read lacks a failure handler; failures can be invisible while optimistic state remains changed.
- Server functions largely assume sheets and valid payloads exist. Some missing-sheet cases throw, while Tasks writes and logging silently return; invalid truthy dates can throw during ISO conversion.

### Empty states

- Dashboard department: “No projects found in this department.”
- Last/current task period: “No tasks scheduled for …”.
- RAID filter: “No items found for this filter.”
- Logs: “No logs available or fetching...” (cannot distinguish empty, loading, or failed).
- Comments: “No comments yet. Start the discussion!”
- Project metadata uses `-`, `$0`, “No objective defined.”, and “No scope defined.” fallbacks.
- Activities have no explicit empty-state message; only the Add Activity footer remains.

## Identity and security behavior (documentation only)

- `Session.getActiveUser().getEmail()` supplies current-user context on dashboard loads and authorship for server-created logs/comments.
- Cached dashboard content never includes the cached caller: on a cache hit the server injects the fresh email into parsed data. On an uncached response, it adds `currentUser` only after placing the project-only result in cache.
- Dashboard load does not replace an empty email with `Unknown User`; optimistic frontend comments do. Comment and log server writes also apply that fallback.
- Identity determines presentation (“You”) and audit/comment attribution only. No source-level authentication, authorization, role, ownership, or department restriction is implemented.
- The Apps Script web-app deployment settings are not present in the repository, so actual access scope and whether active-user email is available cannot be concluded from source.
- `ALLOWALL` permits the served page to be embedded; whether that is required needs later security review.

## Caching behavior

- Script-wide cache key: `dashboardData`; TTL: 900 seconds (15 minutes).
- Cached JSON contains `{ projects }`, including nested activities, comments, RAID items/comments, and tasks; it intentionally excludes `currentUser` when first written.
- Cache is shared at script level rather than per user. This is consistent with the dashboard payload being unfiltered by identity.
- Successful project/activity/task/RAID upserts and matching deletes clear the key. Both comment creates clear it.
- A delete that finds no matching row does not clear cache. Missing Tasks sheet returns before clearing. Logs are neither cached nor cache-invalidating.
- Cache parse/put failures have no recovery path in the source.

## Audit logging behavior

- Project, activity, task, and RAID creates/updates/deletes log fixed messages; activity and RAID comments log generic COMMENT events.
- Logging appends ISO timestamp, active-user email/fallback, action type, target label, and details to ActionLog.
- If ActionLog is missing, logging silently does nothing without failing the underlying operation.
- The log does not contain target IDs, before/after values, request IDs, or guaranteed immutable storage.
- Project deletion’s detail says associated data was deleted, but only the Projects row is deleted.
- Reading logs is not itself logged.

## Browser-only behavior suitable for largely unchanged migration

- Department, RAID, and task-period filtering and in-memory sorting.
- Monday–Sunday week and calendar-month boundary calculations.
- Gantt window calculation, cross-year absolute-month math, clipping, percentage positioning, tooltips, WBS indentation, and current-date line.
- Display date localization and comment auto-scroll.
- Browser-native print/PDF: temporarily changes `document.title` to a sanitized contextual filename, calls `window.print()`, restores title after 100 ms, requests landscape with 0.4-inch margins, preserves colors, hides `.print-hide`, removes shadows, expands content width, and tries to avoid block/row page breaks.
- Dashboard filename is `SPH_<department>_Report` (or `SPH_All_Departments_Report`); detail filename is `SPH_Project_<sanitized project name>`. The browser/user still controls print destination and actual filename.

## Implicit, ambiguous, or potentially inconsistent behavior

These observations describe implementation, not endorsed requirements:

1. Deletes have no confirmation and mutate the UI before the server succeeds.
2. Project deletion does not cascade, contradicting its audit message; all child deletes can orphan comments.
3. CRUD has no client or server validation, uniqueness enforcement, concurrency handling, permissions, or reliable success feedback. Whole-row last-write-wins updates can overwrite concurrent edits.
4. Embedded local mock data may conceal the absence of Apps Script and is not identical to persisted shapes (mock tasks omit `projectId`).
5. Client and server independently generate comment IDs/timestamps; the UI ignores server return values, so displayed optimistic metadata may differ from persisted metadata.
6. An empty active-user email is treated inconsistently between dashboard context and log/comment fallbacks.
7. Project/Activity read defaults and UI fallbacks differ: Activity read year defaults to 2024, while Gantt rendering often falls back to 2026.
8. Activity dates approximate every month as 30 days, use day/30 rather than `(day-1)/daysInMonth`, and can display boundary dates unexpectedly.
9. Gantt end labels use the mathematical endpoint, so the visual/wording semantics of inclusive versus exclusive end are unclear.
10. Fixed year options end at 2029. Activities can contain other years but cannot select them in the dashboard controls.
11. Only milestones appear on the overview; `isMilestone` naming and “Show on Dashboard” label imply a display flag as well as milestone semantics.
12. Task view hides all dates outside the current and immediately previous period; invalid/blank dates silently match neither.
13. Calling `new Date(e.target.value).toISOString()` for a blank/invalid task date can fail in the browser.
14. Sheet headers are ignored by name; reordered/extra/missing columns can silently corrupt meaning. Empty or missing sheets have inconsistent handling.
15. Unknown enum values remain data but may lack intended labels/styles/filter access.
16. Financial values are free text with no numeric validation or currency model.
17. No explicit empty Activities message, save state, deletion state, write failure state, or comment/log failure state exists.
18. Logs expose all stored user emails to anyone able to invoke `getLogs`; intended audience is not defined in source.
19. The third-party comment background image and all CDN assets require network access and external availability.
20. Printing restores the title on a fixed timer; browser print timing may vary.

## Smallest safe recommendation for MIG-03

Make MIG-03 a **documentation and read-only data-contract decision task**, not a full CRUD migration: resolve the owner questions that affect data integrity (delete/cascade policy, canonical activity dates, identity/audit expectations, enum ownership, and orphan/duplicate handling), then define and test a typed, read-only dashboard data contract using representative sanitized fixtures. Keep database creation, writes, authentication/authorization, and production integration out of MIG-03 until those decisions are approved. This is the smallest scope that reduces schema rework without changing user behavior or creating security-sensitive infrastructure.
