create table public.blog_posts (
  id uuid primary key,
  title text not null check (char_length(title) between 5 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(excerpt) between 10 and 500),
  content_markdown text not null check (char_length(content_markdown) between 50 and 40000),
  seo_title text not null default '',
  seo_description text not null default '',
  author_name text not null,
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status='draft' or published_at is not null)
);
create index blog_posts_publication_idx on public.blog_posts(status,published_at desc);
alter table public.blog_posts enable row level security;
-- Public articles are rendered by server routes with an explicit publication filter.
-- Drafts and administration are never exposed through the public Data API.
revoke all on public.blog_posts from anon, authenticated;
grant all on public.blog_posts to service_role;
