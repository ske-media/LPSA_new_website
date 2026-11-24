-- Accept the "petits-lots" need (associations and small volumes) for leads.
-- To apply manually in the SQL editor of the production project, like the previous migrations.
begin;
alter table public.leads drop constraint if exists leads_need_check;
alter table public.leads add constraint leads_need_check
  check (need in ('lavage','gobelets','vaisselle','petits-lots','conseil','stockage'));
commit;
