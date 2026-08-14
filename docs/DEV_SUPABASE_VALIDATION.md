# MIG-05 DEV Supabase Validation

## Objective

Safely deploy the approved MIG-04 Supabase foundation to the existing hosted DEV project and validate its schema, row-level security (RLS), trusted RPCs, archive behavior, audit behavior, and four-role access model.

## Scope

### In scope

- The existing Supabase **DEVELOPMENT** project only.
- Migration-history and schema-drift inspection before deployment.
- A mandatory **`supabase db push --dry-run`** gate followed, only when clean, by **`supabase db push`** without seed data.
- Hosted schema, grants, RLS, RPC, role, archive, audit, and disposable-record validation.
- Assessment of generated Supabase TypeScript database types after successful deployment.

### Out of scope

- Any Production contact or change.
- Remote database reset, hosted seed import, real employee accounts, Production authentication UI, real data import, permanent purge, frontend migration, Cloudflare changes, and paid services.
- Rewriting or manually reproducing MIG-04.

### Acceptance criteria

The DEV identity is independently confirmed as not Production; no untracked schema drift exists; the dry run lists only the approved MIG-04 migration; the migration is applied without seed data; every required hosted schema, RPC, RLS, role, archive, audit, and mutation check passes; and evidence is recorded here without secrets.

## Overall result

**DEV VALIDATION INCOMPLETE**

MIG-05A adds the controlled GitHub workflow but does not itself run a hosted deployment. The supplied DEV and Production references are separated by a hard-coded target guard. This Codex environment has no Supabase credentials or authenticated CLI, and this task explicitly prohibits deploying Supabase from Codex.

No remote schema inspection, link, dry run, push, hosted validation, test-user provisioning, or remote type generation was attempted. The owner must deliberately run the reviewed workflow with the protected **`development`** Environment.

## Target environment

- Target classification: **DEVELOPMENT**
- DEV Supabase project reference: **`iserxjzcqwyphyvzlatr`**
- Production project reference used only by the workflow's deny guard: **`verjvldpfyubgzurpxzp`**
- Automated deployment target: hard-coded DEV reference; no project-reference input is accepted

The local **`project_id = "proj-port-dash"`** in **`supabase/config.toml`** names the local Supabase stack. It is not evidence of a hosted Supabase project reference and must not be used as one.

## MIG-05A GitHub workflow

**`.github/workflows/supabase-dev-deploy.yml`** provides the manually triggered **DEV Supabase Migration** workflow. It has two owner-selected operations:

- **`dry-run`** (the safe default): links DEV, lists linked migration history, runs **`supabase db push --dry-run`**, and does not deploy.
- **`deploy`**: performs the same target guard, link, migration list, and dry run before running **`supabase db push`**.

The workflow uses the GitHub Environment named **`development`**, read-only repository permissions, pinned Supabase CLI **`2.39.2`**, and the non-cancelling **`supabase-dev-deployment`** concurrency group. It cannot accept an arbitrary project reference. It neither resets a linked database nor includes seed data.

The workflow prints the DEVELOPMENT classification, non-secret DEV reference, migration history, dry-run output, and deployment eligibility in the run summary. It does not echo either secret. The initial expected pending migration is **`202608130001_mig04_foundation.sql`**; future version-controlled migrations are permitted and are deliberately surfaced for owner review rather than blocked by a permanent single-migration rule.

## MIG-04 baseline

- Base revision: **`3774fc07e95929dce6077e9f0cb2f1a1565d210b`** (merge of MIG-04 pull request #18)
- Migration source of truth: **`supabase/migrations/202608130001_mig04_foundation.sql`**
- The Database tests workflow remains at **`.github/workflows/database-tests.yml`**. It reconstructs an isolated local database from migrations and seed, then runs **`supabase test db`**.
- Foundation suite: **`supabase/tests/mig04_foundation_test.sql`**, plan of 41 assertions.
- Integrity suite: **`supabase/tests/mig04_integrity_test.sql`**, plan of 32 assertions.
- Total planned assertions: 73.
- The merge history includes the database-test workflow and follow-up authorization, Gantt-parity, and archive-comment regression fixes. No repository marker identifies an unresolved P1/P2 database-review finding.
- GitHub's hosted check result could not be queried because this checkout has no configured Git remote or GitHub repository identity. The owner's supplied MIG-04 approval and 73-passing-assertion record therefore remain the CI evidence for this run.

## Existing DEV schema inspection

**Not run.** Codex did not contact the supplied DEV project. Existing public tables, functions, migration history, and possible drift are unknown. The workflow's migration list and dry run must be reviewed before deployment. If any hosted object or migration-history entry is not represented in Git, stop and reconcile it through a reviewed, version-controlled migration; do not overwrite it or reset the database.

## Dry run

**`supabase db push --dry-run`** was **not executed from Codex**. It is now the mandatory first operation in the manual GitHub workflow. Consequently, there is no hosted pending-migration output to report yet and the owner must not select **`deploy`** until a successful dry-run summary has been reviewed.

The acceptable dry-run result is exactly one pending migration:

```
```

```
202608130001_mig04_foundation.sql
```

Any other pending migration, migration-history mismatch, unexpected/destructive change, unrelated schema, or Production identity is a stop condition.

## Migration applied

None. In particular, neither **`supabase db push`** nor **`supabase db push --include-seed`** was run.

The seed was reviewed and is unsuitable for automatic hosted deployment: **`supabase/seed.sql`** writes fictional rows directly to **`auth.users`** as well as application fixtures. It is retained for isolated local database testing only.

## DEV schema verification

Not run because no migration was applied. Hosted confirmation remains required for all eight tables, UUID primary keys, legacy IDs, project ordering, archive timestamps, currency and exact-date fields, legacy Gantt fields, immutable comments, nullable historical identities, indexes, constraints, update triggers, and RLS enablement.

## DEV RPC verification

Not run against hosted DEV. Repository inspection confirms MIG-04 defines the expected 14 browser-facing mutation functions:

- Project: **`create_project`**, **`update_project`**, **`archive_project`**
- Activity: **`create_activity`**, **`update_activity`**, **`archive_activity`**
- Task: **`create_task`**, **`update_task`**, **`archive_task`**
- RAID: **`create_raid_item`**, **`update_raid_item`**, **`archive_raid_item`**
- Comments: **`create_activity_comment`**, **`create_raid_comment`**

The migration also revokes browser-role execution of **`set_updated_at`**, **`current_profile`**, **`require_editor`**, and **`write_audit`**. Hosted catalog and privilege confirmation remains required.

## DEV RLS verification

Not run against hosted DEV. The 41-assertion repository foundation suite covers anonymous denial, active-only portfolio reads, direct-write denial, audit visibility, trusted RPC access, self-promotion denial, trusted comment identity, immutable comments, archive visibility, retained underlying history, and direct audit-write denial. The hosted four-role matrix still requires validation with DEV-only authenticated identities.

## Hosted validation results

All 23 hosted validation scenarios are **not run**. No disposable records were created because this task prohibits a hosted deployment from Codex. Local pgTAP was not redirected to any hosted database and no linked reset was performed.

## Test users / roles

No hosted users or profiles were created. The required DEV-only **`viewer`**, **`editor`**, **`auditor`**, and **`administrator`** identities remain to be provisioned through normal Supabase Auth. Passwords must be supplied out of band and must never be committed or copied into this document.

## Database types

Generated database types were **not introduced** because the hosted DEV schema was not deployed or verified. After successful validation, generate them from the confirmed DEV project with:

```
```

```
supabase gen types typescript --project-id "$DEV_PROJECT_REF" --schema public > src/types/database.ts
```

Review the generated diff before committing it. **`src/types/database.ts`** should describe Supabase rows and RPCs, while **`src/types/portfolio.ts`** remains the application/domain contract. The intended boundary is:

```
```

```
Supabase database types
        ↓
adapter/repository
        ↓
portfolio domain types
```

## Manual owner actions

These steps intentionally require a trusted owner. They are based on visible GitHub controls and workflow output.

1. In GitHub, open **Settings → Environments → New environment**, create **`development`**, and add required reviewers if that protection is available on the repository's plan.
2. In the **`development`** Environment, add the Supabase Personal Access Token as the secret **`SUPABASE_ACCESS_TOKEN`**.
3. In the same Environment, add the database password for DEV project **`iserxjzcqwyphyvzlatr`** as **`DEV_SUPABASE_DB_PASSWORD`**. Never use the Production password or credentials here.
4. After this workflow is reviewed and merged, open **GitHub → Actions → DEV Supabase Migration → Run workflow**.
5. Select **`operation = dry-run`**, start the run, and open its summary when it finishes.
6. Confirm the summary says **Target environment: DEVELOPMENT**, shows DEV reference **`iserxjzcqwyphyvzlatr`**, and shows only expected version-controlled migrations. The initial expected pending migration is **`202608130001_mig04_foundation.sql`**. Stop if linking, migration history, or dry run fails or anything is unexpected.
7. Only after reviewing a successful dry run, start a new **DEV Supabase Migration** run with **`operation = deploy`**. Approve the **`development`** Environment review if configured.
8. Confirm the deploy run first repeats the successful migration list and dry run, then reports a successful DEV push. A dry-run workflow never performs the push.
9. Continue the hosted schema, RPC, RLS, disposable-user, archive, and audit checks described in this document. Do not reset DEV, deploy seed data, or use Production credentials.
10. Update this document with the UTC deployment time, exact non-secret results, role labels, defects, and any version-controlled corrective migration. Do not merge or deploy to Production automatically.

## Defects found

No hosted defect could be assessed. The remaining limitation is operational, not a MIG-04 defect: the new manual workflow still needs its protected secrets configured and an owner-triggered dry run.

If hosted validation reveals a defect, do not patch the dashboard manually. Add a new version-controlled corrective migration and regression test, run all checks, repeat drift inspection and dry run, then apply only that corrective migration to DEV.

## Not changed

- MIG-04 migration, tests, seed, and approved architecture
- Application behavior and authentication UI
- **`legacy/`** references
- Cloudflare configuration and deployment behavior
- Production data, schema, users, and configuration

## Remaining risks / follow-ups

- The owner must verify the displayed DEV reference before approving a deployment run.
- Hosted drift and migration history are unknown.
- The dry run, deployment, hosted structure checks, and all role-based scenarios remain outstanding.
- Test identities need secure manual provisioning.
- Database type generation must wait for a verified hosted schema.
- The CI status should be checked in GitHub because it was unavailable from this checkout.

## Production status

Production Supabase was not contacted or modified.

## Cost impact

Cost impact: $0.
