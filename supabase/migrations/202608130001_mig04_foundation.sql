-- MIG-04: portfolio schema, RLS, and transactional mutation foundation.
create extension if not exists pgcrypto with schema extensions;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (btrim(email) <> ''),
  role text not null check (role in ('viewer','editor','auditor','administrator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(), legacy_id text,
  name text not null check (btrim(name) <> ''), sponsor text not null default '',
  manager text not null default '', tech_lead text not null default '', team_members text not null default '',
  objective text not null default '', scope text not null default '',
  budget_amount numeric(19,2) not null default 0 check (budget_amount >= 0),
  actual_spend_amount numeric(19,2) not null default 0 check (actual_spend_amount >= 0),
  currency_code varchar(3) not null check (currency_code ~ '^[A-Z]{3}$'),
  overall_status text not null default 'Not Started' check (overall_status in ('Not Started','On Track','At Risk','Overdue','Completed')),
  department text not null default 'Infra & Ops' check (department in ('Infra & Ops','Corp Systems','Cyber Security','Digital Workspace')),
  project_type text not null default 'Unassigned' check (project_type in ('Key Project','BAU Project','Unassigned')),
  sort_order integer not null check (sort_order >= 0), deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint projects_sort_order_key unique (sort_order)
);

create table public.activities (
  id uuid primary key default extensions.gen_random_uuid(), legacy_id text,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (btrim(name) <> ''), start_date date not null, end_date date not null,
  status text not null default 'Not Started' check (status in ('Not Started','On Track','At Risk','Overdue','Completed')),
  is_milestone boolean not null default false,
  category text not null default 'Execution' check (category in ('Initiation','Planning','Execution','Monitoring/Testing','Closing')),
  level smallint not null default 0 check (level in (0,1,2)), sort_order integer not null check (sort_order >= 0),
  legacy_start_year integer, legacy_start_month numeric, legacy_duration numeric,
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint activities_dates_check check (end_date >= start_date),
  constraint activities_legacy_gantt_check check (
    (legacy_start_year is null and legacy_start_month is null and legacy_duration is null) or
    (legacy_start_year is not null and legacy_start_month is not null and legacy_duration is not null
      and legacy_start_month >= 0 and legacy_duration > 0)
  )
);

create table public.tasks (
  id uuid primary key default extensions.gen_random_uuid(), legacy_id text,
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null, name text not null check (btrim(name) <> ''), details text not null default '',
  status text not null default 'Pending' check (status in ('Pending','In Progress','Blocked','Completed')),
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.raid_items (
  id uuid primary key default extensions.gen_random_uuid(), legacy_id text,
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null default 'Risk' check (type in ('Risk','Assumption','Issue','Dependency')),
  description text not null check (btrim(description) <> ''), owner text not null default '',
  status text not null default 'Open' check (status in ('Open','Mitigated','Closed')),
  start_date date, end_date date, deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint raid_dates_check check (end_date is null or (start_date is not null and end_date >= start_date))
);

create table public.activity_comments (
  id uuid primary key default extensions.gen_random_uuid(), legacy_id text,
  activity_id uuid not null references public.activities(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_email_snapshot text not null check (btrim(author_email_snapshot) <> ''),
  comment_text text not null check (btrim(comment_text) <> ''), created_at timestamptz not null default now()
);
create table public.raid_comments (
  id uuid primary key default extensions.gen_random_uuid(), legacy_id text,
  raid_item_id uuid not null references public.raid_items(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_email_snapshot text not null check (btrim(author_email_snapshot) <> ''),
  comment_text text not null check (btrim(comment_text) <> ''), created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(), occurred_at timestamptz not null default now(),
  actor_user_id uuid, actor_email_snapshot text not null check (btrim(actor_email_snapshot) <> ''),
  action text not null check (action in ('CREATE','UPDATE','DELETE','COMMENT')),
  entity_type text not null check (entity_type in ('project','activity','task','raid_item','activity_comment','raid_comment')),
  entity_id uuid not null, entity_label text not null check (btrim(entity_label) <> ''), details text
);

create unique index projects_legacy_id_uidx on public.projects(legacy_id) where legacy_id is not null;
create unique index activities_legacy_id_uidx on public.activities(legacy_id) where legacy_id is not null;
create unique index tasks_legacy_id_uidx on public.tasks(legacy_id) where legacy_id is not null;
create unique index raid_items_legacy_id_uidx on public.raid_items(legacy_id) where legacy_id is not null;
create unique index activity_comments_legacy_id_uidx on public.activity_comments(legacy_id) where legacy_id is not null;
create unique index raid_comments_legacy_id_uidx on public.raid_comments(legacy_id) where legacy_id is not null;
create index projects_dashboard_idx on public.projects(department, project_type, sort_order, id);
create index projects_status_idx on public.projects(overall_status) where deleted_at is null;
create index activities_project_order_idx on public.activities(project_id, sort_order, id);
create index activities_milestone_date_idx on public.activities(project_id, is_milestone, start_date);
create index tasks_project_date_idx on public.tasks(project_id, date, id);
create index raid_items_project_type_idx on public.raid_items(project_id, type, created_at, id);
create index activity_comments_parent_idx on public.activity_comments(activity_id, created_at, id);
create index raid_comments_parent_idx on public.raid_comments(raid_item_id, created_at, id);
create index audit_logs_occurred_idx on public.audit_logs(occurred_at desc, id desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, occurred_at desc);

create function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger user_profiles_updated before update on public.user_profiles for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger activities_updated before update on public.activities for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create trigger raid_items_updated before update on public.raid_items for each row execute function public.set_updated_at();

-- SECURITY DEFINER is necessary because authenticated browser users deliberately have no
-- table-write grants. These locked-path helpers are the only trusted mutation boundary.
create function public.current_profile() returns public.user_profiles language plpgsql stable security definer set search_path = '' as $$
declare p public.user_profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into p from public.user_profiles where user_id=auth.uid() and is_active;
  if not found then raise exception 'Active profile required' using errcode='42501'; end if;
  return p;
end $$;
create function public.require_editor() returns public.user_profiles language plpgsql stable security definer set search_path = '' as $$
declare p public.user_profiles := public.current_profile();
begin
  if p.role not in ('editor','administrator') then raise exception 'Editor capability required' using errcode='42501'; end if;
  return p;
end $$;
create function public.write_audit(p_actor public.user_profiles, p_action text, p_type text, p_id uuid, p_label text, p_details text default null)
returns void language sql volatile security definer set search_path = '' as $$
  insert into public.audit_logs(actor_user_id,actor_email_snapshot,action,entity_type,entity_id,entity_label,details)
  values (p_actor.user_id,p_actor.email,p_action,p_type,p_id,p_label,p_details)
$$;

create function public.create_project(p_name text,p_currency_code varchar,p_sponsor text default '',p_manager text default '',p_tech_lead text default '',p_team_members text default '',p_objective text default '',p_scope text default '',p_budget_amount numeric default 0,p_actual_spend_amount numeric default 0,p_overall_status text default 'Not Started',p_department text default 'Infra & Ops',p_project_type text default 'Unassigned')
returns public.projects language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.projects; next_order integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('public.projects.sort_order'));
  select coalesce(max(sort_order)+1,0) into next_order from public.projects;
  insert into public.projects(name,currency_code,sponsor,manager,tech_lead,team_members,objective,scope,budget_amount,actual_spend_amount,overall_status,department,project_type,sort_order)
  values (btrim(p_name),p_currency_code,p_sponsor,p_manager,p_tech_lead,p_team_members,p_objective,p_scope,p_budget_amount,p_actual_spend_amount,p_overall_status,p_department,p_project_type,next_order) returning * into result;
  perform public.write_audit(actor,'CREATE','project',result.id,result.name,'Project created'); return result;
end $$;
create function public.update_project(p_id uuid,p_name text,p_currency_code varchar,p_sponsor text,p_manager text,p_tech_lead text,p_team_members text,p_objective text,p_scope text,p_budget_amount numeric,p_actual_spend_amount numeric,p_overall_status text,p_department text,p_project_type text)
returns public.projects language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.projects;
begin
 update public.projects set name=btrim(p_name),currency_code=p_currency_code,sponsor=p_sponsor,manager=p_manager,tech_lead=p_tech_lead,team_members=p_team_members,objective=p_objective,scope=p_scope,budget_amount=p_budget_amount,actual_spend_amount=p_actual_spend_amount,overall_status=p_overall_status,department=p_department,project_type=p_project_type where id=p_id and deleted_at is null returning * into result;
 if not found then raise exception 'Active project not found'; end if; perform public.write_audit(actor,'UPDATE','project',result.id,result.name,'Project updated'); return result;
end $$;
create function public.archive_project(p_id uuid) returns public.projects language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.projects;
begin update public.projects set deleted_at=now() where id=p_id and deleted_at is null returning * into result; if not found then raise exception 'Active project not found'; end if; perform public.write_audit(actor,'DELETE','project',result.id,result.name,'Project archived'); return result; end $$;

create function public.create_activity(p_project_id uuid,p_name text,p_start_date date,p_end_date date,p_status text default 'Not Started',p_is_milestone boolean default false,p_category text default 'Execution',p_level smallint default 0)
returns public.activities language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.activities; next_order int;
begin if not exists(select 1 from public.projects where id=p_project_id and deleted_at is null) then raise exception 'Active project not found'; end if;
 select coalesce(max(sort_order)+1,0) into next_order from public.activities where project_id=p_project_id;
 insert into public.activities(project_id,name,start_date,end_date,status,is_milestone,category,level,sort_order) values(p_project_id,btrim(p_name),p_start_date,p_end_date,p_status,p_is_milestone,p_category,p_level,next_order) returning * into result;
 perform public.write_audit(actor,'CREATE','activity',result.id,result.name,'Activity created'); return result; end $$;
create function public.update_activity(p_id uuid,p_name text,p_start_date date,p_end_date date,p_status text,p_is_milestone boolean,p_category text,p_level smallint)
returns public.activities language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.activities;
begin update public.activities a set name=btrim(p_name),start_date=p_start_date,end_date=p_end_date,status=p_status,is_milestone=p_is_milestone,category=p_category,level=p_level from public.projects p where a.id=p_id and a.project_id=p.id and a.deleted_at is null and p.deleted_at is null returning a.* into result; if not found then raise exception 'Active activity not found'; end if; perform public.write_audit(actor,'UPDATE','activity',result.id,result.name,'Activity updated'); return result; end $$;
create function public.archive_activity(p_id uuid) returns public.activities language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.activities;
begin update public.activities a set deleted_at=now() from public.projects p where a.id=p_id and a.project_id=p.id and a.deleted_at is null and p.deleted_at is null returning a.* into result; if not found then raise exception 'Active activity not found'; end if; perform public.write_audit(actor,'DELETE','activity',result.id,result.name,'Activity archived'); return result; end $$;

create function public.create_task(p_project_id uuid,p_date date,p_name text,p_details text default '',p_status text default 'Pending') returns public.tasks language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.tasks; begin if not exists(select 1 from public.projects where id=p_project_id and deleted_at is null) then raise exception 'Active project not found'; end if; insert into public.tasks(project_id,date,name,details,status) values(p_project_id,p_date,btrim(p_name),p_details,p_status) returning * into result; perform public.write_audit(actor,'CREATE','task',result.id,result.name,'Task created'); return result; end $$;
create function public.update_task(p_id uuid,p_date date,p_name text,p_details text,p_status text) returns public.tasks language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.tasks; begin update public.tasks t set date=p_date,name=btrim(p_name),details=p_details,status=p_status from public.projects p where t.id=p_id and t.project_id=p.id and t.deleted_at is null and p.deleted_at is null returning t.* into result; if not found then raise exception 'Active task not found'; end if; perform public.write_audit(actor,'UPDATE','task',result.id,result.name,'Task updated'); return result; end $$;
create function public.archive_task(p_id uuid) returns public.tasks language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.tasks; begin update public.tasks t set deleted_at=now() from public.projects p where t.id=p_id and t.project_id=p.id and t.deleted_at is null and p.deleted_at is null returning t.* into result; if not found then raise exception 'Active task not found'; end if; perform public.write_audit(actor,'DELETE','task',result.id,result.name,'Task archived'); return result; end $$;

create function public.create_raid_item(p_project_id uuid,p_type text,p_description text,p_owner text default '',p_status text default 'Open',p_start_date date default null,p_end_date date default null) returns public.raid_items language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.raid_items; begin if not exists(select 1 from public.projects where id=p_project_id and deleted_at is null) then raise exception 'Active project not found'; end if; insert into public.raid_items(project_id,type,description,owner,status,start_date,end_date) values(p_project_id,p_type,btrim(p_description),p_owner,p_status,p_start_date,p_end_date) returning * into result; perform public.write_audit(actor,'CREATE','raid_item',result.id,result.description,'RAID item created'); return result; end $$;
create function public.update_raid_item(p_id uuid,p_type text,p_description text,p_owner text,p_status text,p_start_date date,p_end_date date) returns public.raid_items language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.raid_items; begin update public.raid_items r set type=p_type,description=btrim(p_description),owner=p_owner,status=p_status,start_date=p_start_date,end_date=p_end_date from public.projects p where r.id=p_id and r.project_id=p.id and r.deleted_at is null and p.deleted_at is null returning r.* into result; if not found then raise exception 'Active RAID item not found'; end if; perform public.write_audit(actor,'UPDATE','raid_item',result.id,result.description,'RAID item updated'); return result; end $$;
create function public.archive_raid_item(p_id uuid) returns public.raid_items language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.raid_items; begin update public.raid_items r set deleted_at=now() from public.projects p where r.id=p_id and r.project_id=p.id and r.deleted_at is null and p.deleted_at is null returning r.* into result; if not found then raise exception 'Active RAID item not found'; end if; perform public.write_audit(actor,'DELETE','raid_item',result.id,result.description,'RAID item archived'); return result; end $$;

create function public.create_activity_comment(p_activity_id uuid,p_comment_text text) returns public.activity_comments language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.activity_comments; label text;
begin select a.name into label from public.activities a join public.projects p on p.id=a.project_id where a.id=p_activity_id and a.deleted_at is null and p.deleted_at is null; if not found then raise exception 'Active activity not found'; end if; insert into public.activity_comments(activity_id,author_user_id,author_email_snapshot,comment_text) values(p_activity_id,actor.user_id,actor.email,btrim(p_comment_text)) returning * into result; perform public.write_audit(actor,'COMMENT','activity_comment',result.id,label,'Activity comment created'); return result; end $$;
create function public.create_raid_comment(p_raid_item_id uuid,p_comment_text text) returns public.raid_comments language plpgsql volatile security definer set search_path = '' as $$
declare actor public.user_profiles:=public.require_editor(); result public.raid_comments; label text;
begin select r.description into label from public.raid_items r join public.projects p on p.id=r.project_id where r.id=p_raid_item_id and r.deleted_at is null and p.deleted_at is null; if not found then raise exception 'Active RAID item not found'; end if; insert into public.raid_comments(raid_item_id,author_user_id,author_email_snapshot,comment_text) values(p_raid_item_id,actor.user_id,actor.email,btrim(p_comment_text)) returning * into result; perform public.write_audit(actor,'COMMENT','raid_comment',result.id,label,'RAID comment created'); return result; end $$;

alter table public.user_profiles enable row level security;
alter table public.projects enable row level security; alter table public.activities enable row level security;
alter table public.tasks enable row level security; alter table public.raid_items enable row level security;
alter table public.activity_comments enable row level security; alter table public.raid_comments enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read_self on public.user_profiles for select to authenticated using (user_id=auth.uid() and is_active);
create policy projects_read_active on public.projects for select to authenticated using (deleted_at is null and exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active));
create policy activities_read_active on public.activities for select to authenticated using (deleted_at is null and exists(select 1 from public.projects p where p.id=project_id and p.deleted_at is null) and exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active));
create policy tasks_read_active on public.tasks for select to authenticated using (deleted_at is null and exists(select 1 from public.projects p where p.id=project_id and p.deleted_at is null) and exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active));
create policy raid_items_read_active on public.raid_items for select to authenticated using (deleted_at is null and exists(select 1 from public.projects p where p.id=project_id and p.deleted_at is null) and exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active));
create policy activity_comments_read_visible on public.activity_comments for select to authenticated using (exists(select 1 from public.activities a join public.projects p on p.id=a.project_id where a.id=activity_id and a.deleted_at is null and p.deleted_at is null) and exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active));
create policy raid_comments_read_visible on public.raid_comments for select to authenticated using (exists(select 1 from public.raid_items r join public.projects p on p.id=r.project_id where r.id=raid_item_id and r.deleted_at is null and p.deleted_at is null) and exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active));
create policy audit_logs_read_auditors on public.audit_logs for select to authenticated using (exists(select 1 from public.user_profiles u where u.user_id=auth.uid() and u.is_active and u.role in ('auditor','administrator')));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.user_profiles,public.projects,public.activities,public.tasks,public.raid_items,public.activity_comments,public.raid_comments,public.audit_logs to authenticated;
revoke all on function public.set_updated_at(),public.current_profile(),public.require_editor(),public.write_audit(public.user_profiles,text,text,uuid,text,text) from public,anon,authenticated;
revoke execute on all functions in schema public from public,anon;
grant execute on function public.create_project(text,varchar,text,text,text,text,text,text,numeric,numeric,text,text,text),public.update_project(uuid,text,varchar,text,text,text,text,text,text,numeric,numeric,text,text,text),public.archive_project(uuid),public.create_activity(uuid,text,date,date,text,boolean,text,smallint),public.update_activity(uuid,text,date,date,text,boolean,text,smallint),public.archive_activity(uuid),public.create_task(uuid,date,text,text,text),public.update_task(uuid,date,text,text,text),public.archive_task(uuid),public.create_raid_item(uuid,text,text,text,text,date,date),public.update_raid_item(uuid,text,text,text,text,date,date),public.archive_raid_item(uuid),public.create_activity_comment(uuid,text),public.create_raid_comment(uuid,text) to authenticated;
