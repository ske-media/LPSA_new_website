alter table public.blog_posts
  add column category text not null default 'Guides' check (category in ('Guides','Gobelets','Vaisselle','Collectivités','RSE')),
  add column cover_url text not null default '',
  add column cover_alt text not null default '';

create table public.blog_post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  snapshot jsonb not null,
  saved_at timestamptz not null default now()
);
create index blog_post_versions_post_idx on public.blog_post_versions(post_id,saved_at desc);
alter table public.blog_post_versions enable row level security;
revoke all on public.blog_post_versions from anon,authenticated;
grant all on public.blog_post_versions to service_role;

create function public.save_blog_version() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  insert into public.blog_post_versions(post_id,snapshot) values (old.id,to_jsonb(old));
  return new;
end;
$$;
revoke all on function public.save_blog_version() from public,anon,authenticated;
grant execute on function public.save_blog_version() to service_role;
create trigger blog_version_before_update before update on public.blog_posts
for each row execute function public.save_blog_version();

-- Editorial images are intended for public articles, unlike private lead attachments.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('blog-media','blog-media',true,5000000,array['image/webp']);
-- Uploads are performed by a server route after staff authorization.
-- No anonymous/authenticated write policy is granted on storage.objects.
