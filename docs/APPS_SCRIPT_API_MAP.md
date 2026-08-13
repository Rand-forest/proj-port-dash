# MIG-02 Apps Script API Map

## Scope and interpretation

This is a complete inventory of frontend `google.script.run` calls in `legacy/Index.html` and their matching implementations in `legacy/Code.gs`. “Proposed target replacement” is deliberately high-level; it is not a final architecture or schema decision.

| Frontend function | `google.script.run` call | `Code.gs` function | Sheet(s) involved | Read/write behavior | Current identity/logging behavior | Proposed target replacement |
|---|---|---|---|---|---|---|
| Initial `useEffect` | `.withSuccessHandler(...).withFailureHandler(...).getDashboardData()` | `getDashboardData()` | Projects, Activities, RaidLog, Comments, RaidComments, Tasks | Reads all used ranges, assembles nested project data; may serve shared cache | Reads `Session.getActiveUser().getEmail()` on every request; user is injected after cache read; no audit log | Supabase read plus authentication service |
| `syncProjectToBackend` | `.upsertProject(dataToSave)` | `upsertProject(proj)` | Projects; ActionLog | Finds first ID and overwrites A:M, otherwise appends; clears cache | Logs active user as CREATE/UPDATE when ActionLog exists | Supabase write |
| `syncActivityToBackend` | `.upsertActivity(dataToSave)` | `upsertActivity(act)` | Activities; ActionLog | Finds first ID and overwrites A:J, otherwise appends; clears cache | Logs active user as CREATE/UPDATE | Supabase write |
| `syncTaskToBackend` | `.upsertTask(taskData)` | `upsertTask(task)` | Tasks; ActionLog | Finds first ID and overwrites A:F, otherwise appends; missing Tasks sheet silently returns; clears cache after a write | Logs active user as CREATE/UPDATE | Supabase write |
| `syncRaidToBackend` | `.upsertRaidItem(dataToSave)` | `upsertRaidItem(raid)` | RaidLog; ActionLog | Finds first ID and overwrites A:H, otherwise appends; converts dates; clears cache | Logs active user as CREATE/UPDATE | Supabase write |
| `fetchLogs` | `.withSuccessHandler(setLogs).getLogs()` | `getLogs()` | ActionLog | Reads all rows after header and reverses them; returns `[]` if absent/empty | Displays stored identity; does not log log access | Supabase read; requires architecture decision for audit access |
| `handleDeleteProject` | `.deleteProject(projectId)` | `deleteProject(projectId)` | Projects; ActionLog | Deletes first matching project row only; does not cascade; clears cache when found | Logs DELETE with active user; details inaccurately claim associated data deletion | Supabase write; requires architecture decision for delete policy |
| `handleDeleteActivity` | `.deleteActivity(activityId)` | `deleteActivity(activityId)` | Activities; ActionLog | Deletes first matching row; leaves Comments; clears cache when found | Logs DELETE with active user | Supabase write |
| `handleDeleteTask` | `.deleteTask(taskId)` | `deleteTask(taskId)` | Tasks; ActionLog | Deletes first matching row; missing sheet/no match silently returns | Logs DELETE with active user only when found | Supabase write |
| `handleDeleteRaidItem` | `.deleteRaidItem(raidId)` | `deleteRaidItem(raidId)` | RaidLog; ActionLog | Deletes first matching row; leaves RaidComments; clears cache when found | Logs DELETE with active user | Supabase write |
| `handleAddComment` | `.addComment(commentActivity.id, newComment.commentText)` | `addComment(activityId, commentText)` | Comments; ActionLog | Appends comment, clears cache, returns server row (return is ignored) | Server derives active-user email; logs generic COMMENT | Supabase write plus authentication service |
| `handleAddRaidComment` | `.addRaidComment(commentRaidItem.id, newComment.commentText)` | `addRaidComment(raidId, commentText)` | RaidComments; ActionLog | Creates RaidComments sheet/header if absent, appends, clears cache, returns row (ignored) | Server derives active-user email; logs generic COMMENT | Supabase write plus authentication service |

## Invocation behavior that applies to the map

- Only the initial load registers both success and failure handlers. `getLogs` has a success handler only. Every create/update/delete/comment call is fire-and-forget with no success or failure handler.
- The frontend mutates local React state **before** writes complete. A failed write can therefore look successful until refresh.
- Backend upserts return no value. Deletes return no success/not-found result. Comment return values are ignored, so the UI keeps its locally generated ID, timestamp, and current-user value.
- In local/non-Apps-Script execution, initial load waits 800 ms and uses embedded mock data. Mutation methods change local state but do not persist.
- `doGet(e)`, `clearDashboardCache()`, and `logAction(...)` have no frontend `google.script.run` call. `doGet` is the web-app entry point; the other two are server utilities invoked by write functions.

## Identity and audit boundary

- `getDashboardData`, `logAction`, `addComment`, and `addRaidComment` call `Session.getActiveUser().getEmail()`.
- Dashboard data uses the returned value as-is; logs/comments use `Unknown User` when it is empty.
- The client uses `currentUser` only for display and optimistic comment ownership (“You”). It does not send the user email when creating a comment.
- No Code.gs function checks roles, ownership, department, or permissions. Apps Script deployment/access configuration—not this source—determines who can invoke functions.
- The target must not trust a browser-supplied identity. Exact authentication, authorization, and audit architecture remains a later decision.
