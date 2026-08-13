# MIG-03 Owner Decisions

This log records choices that materially affect future access, destructive behavior, data interpretation, or retention. Pending recommendations are design proposals, not implementation authorization; the multi-currency correction is explicitly owner-approved for future design.

## 1. Who can access and change portfolio data?

- **Decision:** approve the initial user population, whether access is department-wide or portfolio-wide, and who receives viewer, editor, and audit-log access.
- **Legacy behavior:** source code performs no role, ownership, or department authorization; deployment settings are unknown.
- **Recommended target behavior:** authenticated users only; `viewer` reads portfolio data, `editor` mutates it, and a restricted `auditor` capability reads logs. Add department scoping only if the business requires it.
- **Why:** RLS and RPC grants cannot be safely written without knowing the intended access boundary.
- **Risk if unchanged:** unauthorized viewing or editing, or a migration blocked because nobody can state who should have access.
- **Owner choice:** _Pending — identify approved users/groups, role assigners, department scope, and audit viewers._

## 2. Destructive deletion policy

- **Decision:** approve confirmed hard deletion with relational cascades for projects, activities, RAID items, and their descendants.
- **Legacy behavior:** deletes are immediate; children/comments remain as hidden orphans, while the project audit message incorrectly claims associated data was deleted.
- **Recommended target behavior:** show confirmation, then atomically cascade project → activities/tasks/RAID/comments, activity → comments, and RAID item → comments. Never cascade audit logs.
- **Why:** this preserves relational integrity and makes the visible action match stored data and audit wording.
- **Risk if unchanged:** orphan data, misleading audit records, accidental loss from no-confirmation controls, and unclear restoration expectations.
- **Owner choice:** _Pending — approve hard cascade, or request a defined archive/soft-delete and restoration policy._

## 3. Comment retention and lifecycle

- **Decision:** approve immutable comments and whether parent deletion may remove their content.
- **Legacy behavior:** comments can be created/read but not edited or individually deleted; deleting their parent leaves inaccessible orphan rows.
- **Recommended target behavior:** no edit or individual delete; comments cascade with a deleted parent, while append-only audit metadata records the parent deletion without copying comment text.
- **Why:** this matches visible behavior, prevents orphan data, and avoids retaining discussion content without a stated need.
- **Risk if unchanged:** orphaned personal content may be retained indefinitely; adding edit/delete weakens discussion history without an audit requirement.
- **Owner choice:** _Pending — approve cascade removal or specify a legal/business retention period and authorized recovery access._

## 4. Multi-currency project support

- **Decision:** confirm multi-currency project support.
- **Legacy behavior:** free text such as `$495K` is displayed and edited without validation; a generic symbol does not identify one currency reliably.
- **Approved target behavior:** each project stores its own required three-letter ISO 4217 `currency_code`. Its budget and actual spend are interpreted in that currency. Migrated records receive a currency only when the source value or an owner-approved mapping identifies it unambiguously; ambiguous values are included in the migration exception report. No FX conversion is included in the initial migration, and portfolio totals are grouped by currency.
- **Why:** projects can use different currencies, so assuming one default or adding unlike currencies would misstate financial information.
- **Risk if unchanged:** silent currency guesses or cross-currency totals could materially misrepresent project and portfolio finances.
- **Owner choice:** **APPROVED — multi-currency project support.**

## 5. Legacy data exceptions

- **Decision:** decide how reported blank/duplicate IDs, orphans, invalid enum/date values, and unparseable amounts will be repaired or excluded.
- **Legacy behavior:** duplicate IDs are possible, first matches are changed, and orphan rows are silently hidden.
- **Recommended target behavior:** run a dry-run profile; import only valid mapped records; retain legacy IDs in `legacy_id`; present every exception for explicit repair or exclusion approval.
- **Why:** UUID and foreign-key constraints deliberately prevent ambiguous or orphaned target records.
- **Risk if unchanged:** silent data loss, attaching children to the wrong parent, or failure during eventual migration.
- **Owner choice:** _Pending after the sanitized migration profile is available — approve the exception-by-exception disposition._

## 6. Audit retention

- **Decision:** approve who can read audit history and how long it must be retained.
- **Legacy behavior:** all logs are shown together; the sheet can be absent, logging can silently fail, and no retention/tamper policy exists.
- **Recommended target behavior:** trusted transactional generation, append-only browser access, restricted audit readers, and a documented retention period. Retain stable actor/entity IDs and display snapshots, but not secrets or full record payloads.
- **Why:** audit data is security-sensitive and may contain personal identifiers; indefinite or unrestricted retention is not a safe default.
- **Risk if unchanged:** incomplete accountability, excessive personal-data retention, or broad disclosure of user activity.
- **Owner choice:** _Pending — name audit viewers and select a retention requirement before implementation._
