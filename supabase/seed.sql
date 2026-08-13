-- Fictional local/DEV review data only. Reserved .invalid addresses cannot receive email.
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','viewer@example.invalid','',now(),now(),now(),'{}','{}'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','editor@example.invalid','',now(),now(),now(),'{}','{}'),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','auditor@example.invalid','',now(),now(),now(),'{}','{}'),
 ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','administrator@example.invalid','',now(),now(),now(),'{}','{}')
on conflict (id) do nothing;
insert into public.user_profiles(user_id,email,role) values
 ('10000000-0000-0000-0000-000000000001','viewer@example.invalid','viewer'),
 ('10000000-0000-0000-0000-000000000002','editor@example.invalid','editor'),
 ('10000000-0000-0000-0000-000000000003','auditor@example.invalid','auditor'),
 ('10000000-0000-0000-0000-000000000004','administrator@example.invalid','administrator')
on conflict (user_id) do nothing;

insert into public.projects(id,legacy_id,name,department,project_type,overall_status,currency_code,budget_amount,actual_spend_amount,sort_order,deleted_at) values
 ('20000000-0000-0000-0000-000000000001','legacy-project-1','Northstar Network','Infra & Ops','Key Project','On Track','SGD',500000,125000,0,null),
 ('20000000-0000-0000-0000-000000000002','legacy-project-2','Fictional Finance Refresh','Corp Systems','BAU Project','At Risk','USD',200000,90000,1,null),
 ('20000000-0000-0000-0000-000000000003','legacy-project-3','Workspace Wayfinder','Digital Workspace','Unassigned','Not Started','EUR',75000,0,2,null),
 ('20000000-0000-0000-0000-000000000004','legacy-project-4','Archived Security Exercise','Cyber Security','Key Project','Completed','SGD',10000,10000,3,now());
insert into public.activities(id,legacy_id,project_id,name,start_date,end_date,status,is_milestone,category,level,sort_order,legacy_start_year,legacy_start_month,legacy_duration) values
 ('30000000-0000-0000-0000-000000000001','legacy-activity-boundary','20000000-0000-0000-0000-000000000001','Boundary milestone','2026-01-01','2026-01-01','Completed',true,'Initiation',0,0,2026,0,0.03),
 ('30000000-0000-0000-0000-000000000002','legacy-activity-same','20000000-0000-0000-0000-000000000001','Same month build','2026-02-05','2026-02-20','On Track',false,'Execution',1,1,2026,1.13,0.50),
 ('30000000-0000-0000-0000-000000000003','legacy-activity-cross-month','20000000-0000-0000-0000-000000000002','Cross month test','2026-03-20','2026-04-10','At Risk',false,'Monitoring/Testing',0,0,2026,2.63,0.70),
 ('30000000-0000-0000-0000-000000000004','legacy-activity-cross-year','20000000-0000-0000-0000-000000000003','Cross year plan','2026-12-15','2027-01-20','Not Started',false,'Planning',2,0,2026,11.47,1.20),
 ('30000000-0000-0000-0000-000000000005','legacy-activity-archived-parent','20000000-0000-0000-0000-000000000004','Stored archived child','2025-01-01','2025-01-31','Completed',false,'Closing',0,0,2025,0,1);
insert into public.tasks(id,legacy_id,project_id,date,name,details,status) values
 ('40000000-0000-0000-0000-000000000001','legacy-task-1','20000000-0000-0000-0000-000000000001','2026-02-10','Confirm test window','Fictional fixture','In Progress');
insert into public.raid_items(id,legacy_id,project_id,type,description,owner,status,start_date,end_date) values
 ('50000000-0000-0000-0000-000000000001','legacy-raid-risk','20000000-0000-0000-0000-000000000001','Risk','Reserved test risk','Alex Example','Open','2026-01-01','2026-02-01'),
 ('50000000-0000-0000-0000-000000000002','legacy-raid-assumption','20000000-0000-0000-0000-000000000001','Assumption','Reserved test assumption','Blair Example','Mitigated',null,null),
 ('50000000-0000-0000-0000-000000000003','legacy-raid-issue','20000000-0000-0000-0000-000000000002','Issue','Reserved test issue','Casey Example','Closed','2026-03-01','2026-03-12'),
 ('50000000-0000-0000-0000-000000000004','legacy-raid-dependency','20000000-0000-0000-0000-000000000003','Dependency','Reserved test dependency','Dana Example','Open',null,null);
insert into public.activity_comments(id,legacy_id,activity_id,author_user_id,author_email_snapshot,comment_text,created_at) values
 ('60000000-0000-0000-0000-000000000001','legacy-comment-1','30000000-0000-0000-0000-000000000001',null,'historical.author@example.invalid','Imported fictional history','2025-01-01');
insert into public.raid_comments(id,legacy_id,raid_item_id,author_user_id,author_email_snapshot,comment_text,created_at) values
 ('70000000-0000-0000-0000-000000000001','legacy-raid-comment-1','50000000-0000-0000-0000-000000000001',null,'historical.raid@example.invalid','Imported fictional RAID history','2025-01-02');
insert into public.audit_logs(id,occurred_at,actor_user_id,actor_email_snapshot,action,entity_type,entity_id,entity_label,details) values
 ('80000000-0000-0000-0000-000000000001','2025-01-01',null,'historical.actor@example.invalid','CREATE','project','20000000-0000-0000-0000-000000000001','Northstar Network','Imported fictional history');
