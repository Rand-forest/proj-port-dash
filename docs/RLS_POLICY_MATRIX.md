# MIG-04 RLS Policy Matrix

## Plain-English rule

The browser receives direct **read** access only. It receives no insert, update, or delete table grants. Every business write must call one of the approved functions, which rechecks identity and capability and writes one audit event in the same database transaction.

| Data | Anonymous | Viewer | Editor | Auditor | Administrator |
| --- | --- | --- | --- | --- | --- |
| Active projects | No | Read | Read | Read | Read |
| Active activities/tasks/RAID under active projects | No | Read | Read | Read | Read |
| Comments whose parent and project are active | No | Read | Read | Read | Read |
| Own active profile | No | Read | Read | Read | Read |
| Audit logs | No | No | No | Read | Read |
| Direct table writes | No | No | No | No | No |
| Business mutation RPCs | No | No | Yes | No | Yes |
| Role/profile administration | No public operation | No | No | No | No public operation |

An inactive or missing profile sees no application records. Portfolio authorization is deliberately portfolio-wide; department filtering is presentation behavior, not an access boundary.

## Archived data

RLS hides a business row when its own `deleted_at` is set. It also checks the owning project, so an otherwise-active child disappears when its project is archived. A comment is readable only while its activity/RAID parent and project are active. Archive never deletes the stored comments.

## Why functions use elevated execution

Mutation functions use `SECURITY DEFINER` because authenticated users intentionally have no direct write privileges. Each function has an empty locked `search_path`, schema-qualifies stored objects, derives the user with `auth.uid()`, loads an active trusted profile, and accepts no actor/author/timestamp/audit-action arguments. Execute permission is revoked from Public and Anonymous and granted only for the named public RPCs to Authenticated. Internal identity/audit helpers cannot be called by browser roles.

There is no role-management RPC. Even Administrators cannot edit profiles through ordinary browser access, preventing self-promotion. Initial real assignments require a separately controlled DEV/Production operational decision.
