begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

select throws_ok($$insert into public.projects(name,currency_code,sort_order) values('Negative order','USD',-1)$$,'23514',null,'negative project order rejected');
select throws_ok($$insert into public.projects(name,currency_code,sort_order) values('No currency',null,90)$$,'23502',null,'currency required');
select throws_ok($$insert into public.projects(name,currency_code,sort_order) values('Bad currency','usd',91)$$,'23514',null,'currency shape enforced');
select lives_ok($$insert into public.projects(name,currency_code,sort_order) values('Another USD project','USD',92),('Another EUR project','EUR',93)$$,'multiple currencies coexist');
select throws_ok($$insert into public.projects(name,currency_code,budget_amount,sort_order) values('Negative money','USD',-0.01,94)$$,'23514',null,'negative budget rejected');
select throws_ok($$insert into public.projects(name,currency_code,actual_spend_amount,sort_order) values('Negative spend','USD',-0.01,95)$$,'23514',null,'negative spend rejected');
select throws_ok($$insert into public.projects(name,currency_code,overall_status,sort_order) values('Bad status','USD','Unknown',96)$$,'23514',null,'invalid project status rejected');
select throws_ok($$insert into public.projects(name,currency_code,sort_order,legacy_id) values('Duplicate legacy','USD',97,'legacy-project-1')$$,'23505',null,'non-null legacy ID unique');

select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order) values('20000000-0000-0000-0000-000000000001','Backwards','2026-02-02','2026-02-01',10)$$,'23514',null,'activity date order enforced');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,level) values('20000000-0000-0000-0000-000000000001','Bad level','2026-02-01','2026-02-02',11,3)$$,'23514',null,'activity level enforced');
select lives_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','No legacy parity','2026-02-01','2026-02-02',12,null,null,null)$$,'all-null Gantt parity accepted');
select lives_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Complete legacy parity','2026-02-01','2026-02-02',13,2026,1.25,0.50)$$,'complete valid Gantt parity accepted');
-- Every partial-null permutation is explicit: PostgreSQL CHECK treats NULL as passing unless
-- the invariant itself uses IS NULL / IS NOT NULL for all three nullable columns.
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Year and duration only','2026-02-01','2026-02-02',14,2026,null,2)$$,'23514',null,'year present, month null, duration present rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Year and month only','2026-02-01','2026-02-02',15,2026,1,null)$$,'23514',null,'year present, month present, duration null rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Month and duration only','2026-02-01','2026-02-02',16,null,1,2)$$,'23514',null,'year null, month present, duration present rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Year only','2026-02-01','2026-02-02',17,2026,null,null)$$,'23514',null,'year present, month null, duration null rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Month only','2026-02-01','2026-02-02',18,null,1,null)$$,'23514',null,'year null, month present, duration null rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Duration only','2026-02-01','2026-02-02',19,null,null,2)$$,'23514',null,'year null, month null, duration present rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Negative month','2026-02-01','2026-02-02',20,2026,-0.01,2)$$,'23514',null,'populated month below minimum rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Zero duration','2026-02-01','2026-02-02',21,2026,1,0)$$,'23514',null,'populated non-positive duration rejected');
select throws_ok($$insert into public.activities(project_id,name,start_date,end_date,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values('20000000-0000-0000-0000-000000000001','Negative duration','2026-02-01','2026-02-02',22,2026,1,-0.01)$$,'23514',null,'populated negative duration rejected');
select is((select count(*) from public.activities where legacy_start_year is not null),6::bigint,'complete parity rows remain stored');
select ok(exists(select 1 from public.activities where start_date=end_date and legacy_duration>0),'exact boundary parity remains valid');
select ok(exists(select 1 from public.activities where extract(month from start_date)=extract(month from end_date) and start_date<>end_date),'same-month dates remain valid');
select ok(exists(select 1 from public.activities where extract(month from start_date)<>extract(month from end_date)),'cross-month dates remain valid');
select ok(exists(select 1 from public.activities where extract(year from start_date)<>extract(year from end_date)),'cross-year dates remain valid');

select throws_ok($$insert into public.tasks(project_id,date,name) values('ffffffff-ffff-ffff-ffff-ffffffffffff','2026-01-01','Orphan')$$,'23503',null,'invalid task parent rejected');
select throws_ok($$insert into public.raid_items(project_id,type,description,status,end_date) values('20000000-0000-0000-0000-000000000001','Risk','Missing start','Open','2026-01-02')$$,'23514',null,'RAID end requires start');
select throws_ok($$insert into public.raid_items(project_id,type,description,status) values('20000000-0000-0000-0000-000000000001','Unknown','Bad type','Open')$$,'23514',null,'RAID type enforced');
select is((select count(*) from public.activity_comments where author_user_id is null and author_email_snapshot='historical.author@example.invalid'),1::bigint,'historical comment retains snapshot with null user');
select is((select count(*) from public.audit_logs where actor_user_id is null and actor_email_snapshot='historical.actor@example.invalid'),1::bigint,'historical audit retains snapshot with null actor');
select is((select count(*) from public.raid_items where type in ('Risk','Assumption','Issue','Dependency')),4::bigint,'all approved RAID types coexist');

select * from finish();
rollback;
