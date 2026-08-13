# MIG-04 Trusted Mutation RPC Contract

## Common guarantees

Every public mutation function requires a Supabase authenticated UUID with an active `user_profiles` row. Only Editor and Administrator roles pass the capability check. The function validates table constraints and active parent relationships, changes one business record, derives the email from the trusted profile, and appends one audit event. PostgreSQL commits both actions or rolls both back.

Functions are deliberately `SECURITY DEFINER` so callers cannot gain general table-write access. Their search path is locked, internal helpers are not executable by browser roles, and public functions accept no trusted identity, author, server timestamp, or audit metadata. Constraint or not-found failures are explicit database errors and create no audit event.

## Available functions

| Entity | Create | Update | Archive |
| --- | --- | --- | --- |
| Project | `create_project` (allocates next stable order) | `update_project` | `archive_project` |
| Activity | `create_activity` (next order inside project) | `update_activity` | `archive_activity` |
| Task | `create_task` | `update_task` | `archive_task` |
| RAID item | `create_raid_item` | `update_raid_item` | `archive_raid_item` |
| Activity comment | `create_activity_comment` | Not allowed | Not allowed |
| RAID comment | `create_raid_comment` | Not allowed | Not allowed |

Create functions return the inserted row, update functions return the updated row, and archive functions return the newly archived row. An update/archive targets only an active row beneath an active project. Comment creation similarly requires a visible active parent and takes only the parent ID and comment text; the database supplies author identity and time.

## Audit actions

- Create records use `CREATE`.
- Update records use `UPDATE`.
- Archive records use the legacy-compatible `DELETE` action with details explicitly saying “archived.”
- New comments use `COMMENT` and an entity type that identifies the new comment.

Audit storage is append-only to browser callers. It includes actor and entity snapshots but no full input payload or secrets. No retention expiry is implemented.

## Deliberately absent

There are no generic CRUD, comment update/delete, restore, purge, role-assignment, import, or audit-write RPCs. These omissions are safety boundaries, not unfinished endpoints.
