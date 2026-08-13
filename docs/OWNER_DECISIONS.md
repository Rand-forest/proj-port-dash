# MIG-03 Owner Decisions

This log records choices that materially affect future access, destructive behavior, data interpretation, or retention. Pending recommendations are design proposals, not implementation authorization; the multi-currency correction is explicitly owner-approved for future design.

## 1. Initial user and administrator assignments

- **Decision:** identify the initial users, their roles, and the administrators allowed to manage access.
- **Legacy behavior:** source code performs no role, ownership, or department authorization; deployment settings are unknown.
- **Approved target behavior:** access is initially portfolio-wide. `viewer` reads portfolio data; `editor` also performs approved mutations/comments; `auditor` reads portfolio data and audit logs; `administrator` has editor plus restricted access-management/administrative capabilities. Users cannot self-assign roles. Department-scoped authorization is not included.
- **Why:** implementation still needs a named initial user/role assignment even though the role capabilities and portfolio-wide boundary are resolved.
- **Risk if unchanged:** unauthorized viewing or editing, or a migration blocked because nobody can state who should have access.
- **Owner choice:** _Pending — provide the initial user-to-role list and identify the first administrators._

## 2. Recoverable deletion/archive policy

- **Decision:** confirm recoverable archive behavior for ordinary application deletion.
- **Legacy behavior:** deletes are immediate; children/comments remain as hidden orphans, while the project audit message incorrectly claims associated data was deleted.
- **Approved target behavior:** ordinary delete archives the selected business record using `deleted_at`; normal reads hide archived records and descendants of archived parents. Children and comments remain recoverable. Permanent purge is not ordinary behavior and is reserved for a future restricted Administrator capability. Audit records remain independent.
- **Why:** this prevents orphans and accidental irreversible loss while supporting recovery.
- **Risk if unchanged:** immediate hard deletion could irreversibly remove related records and comments.
- **Owner choice:** **APPROVED — recoverable archive for normal deletion.**

## 3. Comment retention and lifecycle

- **Decision:** approve immutable comments and whether parent deletion may remove their content.
- **Legacy behavior:** comments can be created/read but not edited or individually deleted; deleting their parent leaves inaccessible orphan rows.
- **Approved target behavior:** no edit or ordinary individual delete; comments remain associated with an archived parent and become visible again if it is restored.
- **Why:** this matches visible behavior, prevents orphan data, and preserves discussion integrity through archive and restore.
- **Risk if unchanged:** hard deletion could remove discussion history, while edit/delete would weaken its integrity.
- **Owner choice:** **APPROVED — immutable comments retained with archived parents.**

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

- **Decision:** approve how long audit history must be retained.
- **Legacy behavior:** all logs are shown together; the sheet can be absent, logging can silently fail, and no retention/tamper policy exists.
- **Recommended target behavior:** trusted transactional generation, append-only storage, auditor/administrator reads, and a documented retention period. Retain stable actor/entity IDs and display snapshots, but not secrets or full record payloads.
- **Why:** audit data is security-sensitive and may contain personal identifiers; indefinite or unrestricted retention is not a safe default.
- **Risk if unchanged:** incomplete accountability, excessive personal-data retention, or broad disclosure of user activity.
- **Owner choice:** _Pending — select the audit retention requirement before implementation._
