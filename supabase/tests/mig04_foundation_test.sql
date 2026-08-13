begin;
create extension if not exists pgtap with schema extensions;
select plan(41);

select has_table('public','projects','projects exists');
select has_table('public','audit_logs','audit log exists');
select col_is_null('public','activity_comments','author_user_id','historical author may be null');
select col_is_null('public','audit_logs','actor_user_id','historical actor may be null');
select col_not_null('public','projects','currency_code','currency is required');
select col_hasnt_default('public','projects','currency_code','currency has no default');
select policies_are('public','audit_logs',array['audit_logs_read_auditors'],'audit has one read policy');
select isnt_empty($$select indexname from pg_indexes where indexname='projects_legacy_id_uidx' and indexdef ilike '%where (legacy_id is not null)%'$$,'legacy ID is partially unique');

-- Application checks set both the PostgreSQL API role and the JWT subject used by auth.uid().
-- Metadata and cross-role verification run as the local test administrator after RESET ROLE.
select set_config('request.jwt.claim.sub','',true);
set local role anon;
select throws_ok($$select count(*) from public.projects$$,'42501','permission denied for table projects','anonymous cannot read projects');
select throws_ok($$select public.create_project('Nope','USD')$$,'42501','permission denied for function create_project','anonymous cannot call RPC');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
select is((select count(*) from public.projects),3::bigint,'viewer reads active projects only');
select is((select count(*) from public.activities),4::bigint,'archived project descendants hidden');
select is((select count(*) from public.audit_logs),0::bigint,'viewer cannot read audit');
select throws_ok($$select public.create_project('Nope','USD')$$,'42501','Editor capability required','viewer cannot mutate');
select throws_ok($$update public.user_profiles set role='administrator' where user_id=auth.uid()$$,'42501','permission denied for table user_profiles','viewer cannot self-promote');
select throws_ok($$insert into public.projects(name,currency_code,sort_order) values('Bypass','USD',99)$$,'42501','permission denied for table projects','direct mutation denied');

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
select is((select count(*) from public.projects),3::bigint,'editor reads');
select is((select count(*) from public.audit_logs),0::bigint,'editor cannot read audit');
select lives_ok($$select public.create_project('RPC Created','EUR')$$,'editor can create by RPC');
select throws_ok($$select public.create_project('   ','USD')$$,'23514',null,'failed mutation rejects blank project');
select is((select sort_order from public.projects where name='RPC Created'),4,'create allocates deterministic next ordering');
select is((select count(*) from public.audit_logs where entity_label='RPC Created' and action='CREATE'),0::bigint,'editor cannot see audit even after mutation');
reset role;
select is((select count(*) from public.audit_logs where entity_label='RPC Created' and actor_user_id='10000000-0000-0000-0000-000000000002'),1::bigint,'mutation writes exactly one trusted-actor audit');
select is((select count(*) from public.audit_logs where entity_label=''),0::bigint,'failed mutation creates no audit');

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003',true);
select is((select count(*) from public.projects),4::bigint,'auditor reads portfolio');
select ok((select count(*) from public.audit_logs)>0,'auditor reads audit');
select throws_ok($$select public.create_project('Nope','USD')$$,'42501','Editor capability required','auditor role alone cannot mutate');

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000004',true);
select lives_ok($$select public.create_task('20000000-0000-0000-0000-000000000001','2026-08-13','Admin task')$$,'administrator has editor capability');
select ok((select count(*) from public.audit_logs)>0,'administrator reads audit');
select lives_ok($$select public.create_activity_comment('30000000-0000-0000-0000-000000000001','Trusted author')$$,'administrator creates comment');
select is((select author_email_snapshot from public.activity_comments where comment_text='Trusted author'),'administrator@example.invalid','comment author is trusted profile');
select throws_ok($$select public.create_activity_comment('30000000-0000-0000-0000-000000000001','   ')$$,'23514',null,'blank comment rejected');
select throws_ok($$update public.activity_comments set comment_text='Changed'$$,'42501','permission denied for table activity_comments','comments cannot update directly');
select lives_ok($$select public.archive_activity('30000000-0000-0000-0000-000000000001')$$,'archive RPC succeeds');
select is((select count(*) from public.activities where id='30000000-0000-0000-0000-000000000001'),0::bigint,'archived activity hidden from ordinary reads');
select is((select count(*) from public.activity_comments where activity_id='30000000-0000-0000-0000-000000000001'),0::bigint,'archived parent comments hidden from ordinary reads');
select throws_ok($$insert into public.audit_logs(actor_email_snapshot,action,entity_type,entity_id,entity_label) values('forged@example.invalid','CREATE','project',gen_random_uuid(),'Forged')$$,'42501','permission denied for table audit_logs','audit cannot insert directly');
select throws_ok($$update public.audit_logs set details='Changed'$$,'42501','permission denied for table audit_logs','audit cannot update directly');
select throws_ok($$delete from public.audit_logs$$,'42501','permission denied for table audit_logs','audit cannot delete directly');
reset role;
select ok((select deleted_at is not null from public.activities where id='30000000-0000-0000-0000-000000000001'),'archive sets deleted_at');
select is((select count(*) from public.activity_comments where activity_id='30000000-0000-0000-0000-000000000001'),1::bigint,'archived activity comment remains stored');

select * from finish();
rollback;
