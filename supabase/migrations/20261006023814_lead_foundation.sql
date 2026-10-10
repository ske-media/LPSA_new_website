-- LPSA lead foundation. Apply only to the explicitly selected LPSA 2 project.
create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon, authenticated;
grant select on public.staff_members to authenticated;
grant all on public.staff_members to service_role;
create policy staff_read_own_membership on public.staff_members
  for select to authenticated using (user_id = (select auth.uid()));

create table public.leads (
  id uuid primary key,
  need text not null check (need in ('lavage','gobelets','vaisselle','conseil','stockage')),
  name text not null check (char_length(name) between 2 and 200),
  email text not null default '',
  phone text not null default '',
  organization text not null default '',
  status text not null default 'À compléter' check (status in ('À compléter','Nouvelle demande','À qualifier','Devis envoyé','Gagnée','Perdue','Hors cible')),
  details jsonb,
  resume_hash text not null check (resume_hash ~ '^[a-f0-9]{64}$'),
  resume_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email <> '' or phone <> '')
);
create index leads_created_at_idx on public.leads(created_at desc);
alter table public.leads enable row level security;
-- All lead reads/writes go through server routes, which verify staff membership.
-- No public or authenticated direct Data API access, including resume hashes.
revoke all on public.leads from anon, authenticated;
grant all on public.leads to service_role;

create table public.lead_rate_limits (
  identifier text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
alter table public.lead_rate_limits enable row level security;
revoke all on public.lead_rate_limits from anon, authenticated;
grant all on public.lead_rate_limits to service_role;

create function public.consume_lead_limit(identifier text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare current_window timestamptz := to_timestamp(floor(extract(epoch from now()) / 600) * 600);
declare count_attempts integer;
begin
  delete from public.lead_rate_limits where window_start < now() - interval '1 day';
  insert into public.lead_rate_limits as limits(identifier, window_start, attempts)
  values (consume_lead_limit.identifier, current_window, 1)
  on conflict on constraint lead_rate_limits_pkey do update
    set attempts = case when limits.window_start = current_window then limits.attempts + 1 else 1 end,
        window_start = current_window
  returning attempts into count_attempts;
  return count_attempts <= 20;
end;
$$;
revoke all on function public.consume_lead_limit(text) from public, anon, authenticated;
grant execute on function public.consume_lead_limit(text) to service_role;
