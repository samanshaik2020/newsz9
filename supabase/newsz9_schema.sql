-- newsz9.com initial database setup
-- Run this in the Supabase SQL Editor for the dedicated newsz9 project.

create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  language text default 'en' check (language in ('en', 'te')),
  description text,
  created_at timestamptz default now()
);

create table if not exists authors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  bio text,
  avatar_url text,
  role text default 'editor' check (role in ('editor', 'reporter', 'bot')),
  created_at timestamptz default now()
);

create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  summary text,
  content text not null,
  cover_image text,
  category_id uuid references categories(id) on delete set null,
  author_id uuid references authors(id) on delete set null,
  language text default 'en' check (language in ('en', 'te')),
  template text default 'template_1'
    check (template in ('template_1', 'template_2', 'template_3', 'template_4')),
  status text default 'draft'
    check (status in ('draft', 'review', 'published', 'archived')),
  source_url text,
  views integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tags (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null
);

create table if not exists article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists breaking_news (
  id uuid default gen_random_uuid() primary key,
  headline text not null,
  url text,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table articles enable row level security;
alter table categories enable row level security;
alter table authors enable row level security;
alter table tags enable row level security;
alter table article_tags enable row level security;
alter table breaking_news enable row level security;

drop policy if exists "Public read published" on articles;
create policy "Public read published"
  on articles for select
  using (status = 'published');

drop policy if exists "Authenticated manage articles" on articles;
create policy "Authenticated manage articles"
  on articles for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read categories" on categories;
create policy "Public read categories"
  on categories for select
  using (true);

drop policy if exists "Authenticated manage categories" on categories;
create policy "Authenticated manage categories"
  on categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read authors" on authors;
create policy "Public read authors"
  on authors for select
  using (true);

drop policy if exists "Authenticated manage authors" on authors;
create policy "Authenticated manage authors"
  on authors for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read tags" on tags;
create policy "Public read tags"
  on tags for select
  using (true);

drop policy if exists "Authenticated manage tags" on tags;
create policy "Authenticated manage tags"
  on tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read article tags" on article_tags;
create policy "Public read article tags"
  on article_tags for select
  using (true);

drop policy if exists "Authenticated manage article tags" on article_tags;
create policy "Authenticated manage article tags"
  on article_tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public read active breaking" on breaking_news;
create policy "Public read active breaking"
  on breaking_news for select
  using (is_active = true and (expires_at is null or expires_at > now()));

drop policy if exists "Authenticated manage breaking news" on breaking_news;
create policy "Authenticated manage breaking news"
  on breaking_news for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter table articles
  add column if not exists search_vector tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '')
    )
  ) stored;

create index if not exists articles_search_idx on articles using gin(search_vector);
create index if not exists articles_status_published_idx on articles(status, published_at desc);
create index if not exists articles_category_idx on articles(category_id);
create index if not exists breaking_news_active_idx on breaking_news(is_active, created_at desc);

create or replace function increment_views(article_id uuid)
returns void
language sql
security invoker
as $$
  update articles
  set views = coalesce(views, 0) + 1
  where id = article_id and status = 'published';
$$;

insert into categories (name, slug, language) values
  ('National', 'national', 'en'),
  ('Politics', 'politics', 'en'),
  ('Business', 'business', 'en'),
  ('Sports', 'sports', 'en'),
  ('Entertainment', 'entertainment', 'en'),
  ('Technology', 'technology', 'en'),
  ('Telugu News', 'telugu-news', 'te'),
  ('Andhra Pradesh', 'andhra-pradesh', 'te'),
  ('Telangana', 'telangana', 'te')
on conflict (slug) do nothing;

insert into authors (name, email, role) values
  ('NewsBot', 'bot@newsz9.com', 'bot')
on conflict (email) do nothing;

insert into breaking_news (headline, url) values
  ('newsz9 bilingual newsroom setup is underway', '/')
on conflict do nothing;
