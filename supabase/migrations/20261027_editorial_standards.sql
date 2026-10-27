-- Apply after newsz9_schema.sql, before deploying the matching application.
-- Additive: existing stories, bylines and dates are not rewritten or deleted.
begin;
create extension if not exists pgcrypto;
alter table public.authors add column if not exists credentials text;
alter table public.authors add column if not exists expertise text;
alter table public.articles add column if not exists cover_alt text;
alter table public.articles add column if not exists image_credit text;
alter table public.articles add column if not exists sources jsonb not null default '[]'::jsonb;
alter table public.articles add column if not exists original_reporting text;
alter table public.articles add column if not exists editorial_reviewed boolean not null default false;
alter table public.articles add column if not exists ai_assisted boolean not null default false;
alter table public.articles add column if not exists reviewer_id uuid references public.authors(id) on delete set null;
alter table public.articles add column if not exists content_kind text not null default 'news';
alter table public.articles add column if not exists sponsor_name text;
alter table public.articles add column if not exists correction_note text;
alter table public.articles alter column language set default 'te';
alter table public.categories alter column language set default 'te';

-- The app's password-protected APIs use service_role. A Supabase sign-up alone
-- must not grant newsroom write access or reveal private author email addresses.
drop policy if exists "Authenticated manage articles" on public.articles;
drop policy if exists "Authenticated manage categories" on public.categories;
drop policy if exists "Authenticated manage authors" on public.authors;
drop policy if exists "Authenticated manage tags" on public.tags;
drop policy if exists "Authenticated manage article tags" on public.article_tags;
drop policy if exists "Authenticated manage breaking news" on public.breaking_news;
drop policy if exists "Public read published" on public.articles;
create policy "Public read published" on public.articles for select
  using (status = 'published' and language = 'te' and published_at <= now());
revoke select on public.authors from anon, authenticated;
grant select (id, name, bio, avatar_url, role, credentials, expertise) on public.authors to anon, authenticated;

-- Confirmed by the owner. No experience, qualifications, headshot or past bylines are invented.
update public.authors set name = 'గోల్డీ అజిత్', bio = 'గోల్డీ అజిత్ న్యూస్‌జెడ్‌9లో కథనాల రచనకు బాధ్యత వహిస్తారు. ప్రచురిత కథనాలపై ప్రశ్నలు, సవరణ అభ్యర్థనలను సంప్రదింపు పేజీ ద్వారా పంపవచ్చు.'
where lower(regexp_replace(name, '[[:space:]]+', '', 'g')) = 'goldyajit';
insert into public.authors(name, email, bio, role)
select 'గోల్డీ అజిత్', 'goldyajit@gmail.com', 'గోల్డీ అజిత్ న్యూస్‌జెడ్‌9లో కథనాల రచనకు బాధ్యత వహిస్తారు. ప్రచురిత కథనాలపై ప్రశ్నలు, సవరణ అభ్యర్థనలను సంప్రదింపు పేజీ ద్వారా పంపవచ్చు.', 'editor'
where not exists (select 1 from public.authors where name = 'గోల్డీ అజిత్')
on conflict (email) do nothing;

-- Retain category IDs and URLs; translate their visible labels.
insert into public.categories(name, slug, language) values
  ('తెలంగాణ', 'telangana', 'te'),
  ('జాతీయం', 'national', 'te'), ('రాజకీయాలు', 'politics', 'te'),
  ('క్రీడలు', 'sports', 'te'), ('సినిమా', 'entertainment', 'te'),
  ('సాంకేతికత', 'technology', 'te'), ('ఆరోగ్యం', 'health', 'te'),
  ('వ్యాపారం', 'business', 'te'), ('తెలుగు వార్తలు', 'telugu-news', 'te')
on conflict (slug) do update set name = excluded.name, language = 'te';
insert into public.categories(name, slug, language)
select 'ఆంధ్రప్రదేశ్', 'andhra-pradesh', 'te'
where not exists (select 1 from public.categories where slug in ('andhra-pradesh', 'andhrapradesh'));

-- Read-only report for legacy content requiring human attention.
create or replace view public.editorial_review_queue with (security_invoker = true) as
select a.id, a.slug, a.title, a.status,
  a.language <> 'te' as non_telugu,
  a.published_at > now() as future_date,
  not a.editorial_reviewed as needs_review,
  (a.author_id is null or au.role = 'bot' or nullif(au.bio, '') is null) as needs_author,
  jsonb_array_length(a.sources) = 0 as needs_sources,
  nullif(a.cover_alt, '') is null as needs_image_description,
  (select count(*) > 1 from public.articles b where b.status = 'published' and lower(regexp_replace(b.title, '[[:space:][:punct:]]+', '', 'g')) = lower(regexp_replace(a.title, '[[:space:][:punct:]]+', '', 'g'))) as repeated_title
from public.articles a left join public.authors au on au.id = a.author_id;
revoke all on public.editorial_review_queue from anon, authenticated;
grant select on public.editorial_review_queue to service_role;

-- Serializes duplicate checks, including simultaneous publishes and direct database writes.
create or replace function public.enforce_editorial_publication()
returns trigger language plpgsql set search_path = public, extensions as $$
declare title_key text; body_key text; selected_author public.authors; selected_category public.categories; selected_reviewer public.authors;
begin
  if new.status <> 'published' then return new; end if;
  if new.language <> 'te' or new.title !~ '[ఀ-౿]' then raise exception 'తెలుగు కథనాలు మాత్రమే ప్రచురించాలి.'; end if;
  if new.published_at is null or new.published_at > now() then raise exception 'సరైన ప్రచురణ సమయం అవసరం.'; end if;
  if TG_OP = 'UPDATE' and old.published_at is not null and old.published_at <= now() and new.published_at is distinct from old.published_at then
    raise exception 'మొదటి ప్రచురణ తేదీని మార్చవద్దు.';
  end if;
  select * into selected_author from public.authors where id = new.author_id;
  select * into selected_category from public.categories where id = new.category_id;
  if selected_author.id is null or selected_author.role = 'bot' or coalesce(selected_author.bio, '') !~ '[ఀ-౿]' then raise exception 'నిజమైన రచయిత పరిచయం అవసరం.'; end if;
  if selected_category.id is null or selected_category.language <> 'te' then raise exception 'తెలుగు విభాగం అవసరం.'; end if;
  if not new.editorial_reviewed or nullif(new.original_reporting, '') is null or jsonb_typeof(new.sources) <> 'array' or jsonb_array_length(new.sources) = 0 then raise exception 'మానవ సమీక్ష, సొంత పరిశీలన, ఆధారాలు అవసరం.'; end if;
  if nullif(new.cover_image, '') is null or coalesce(new.cover_alt, '') !~ '[ఀ-౿]' or nullif(new.image_credit, '') is null then raise exception 'చిత్రం, తెలుగు వివరణ, వినియోగ హక్కులు అవసరం.'; end if;
  if selected_category.slug ~* 'health' or selected_category.name ~ 'ఆరోగ్య|వైద్య' then
    select * into selected_reviewer from public.authors where id = new.reviewer_id;
    if selected_reviewer.id is null or selected_reviewer.role = 'bot' or nullif(selected_reviewer.credentials, '') is null then raise exception 'నిజంగా సమీక్షించిన వైద్య నిపుణుడి వివరాలు అవసరం.'; end if;
  end if;
  if new.content_kind not in ('news', 'analysis', 'opinion', 'sponsored') then raise exception 'కథనం రకం సరిచూడండి.'; end if;
  if new.content_kind = 'sponsored' and nullif(new.sponsor_name, '') is null then raise exception 'ప్రాయోజకుడిని వెల్లడించాలి.'; end if;
  title_key := lower(regexp_replace(new.title, '[[:space:][:punct:]]+', '', 'g'));
  body_key := lower(regexp_replace(regexp_replace(new.content, '<[^>]*>', '', 'g'), '[[:space:][:punct:]]+', '', 'g'));
  -- One publication transaction at a time: modest newsroom throughput, no duplicate race.
  perform pg_advisory_xact_lock(2099271027);
  if exists(select 1 from public.articles a where a.id <> new.id and a.status = 'published' and (
    lower(regexp_replace(a.title, '[[:space:][:punct:]]+', '', 'g')) = title_key or
    lower(regexp_replace(regexp_replace(a.content, '<[^>]*>', '', 'g'), '[[:space:][:punct:]]+', '', 'g')) = body_key
  )) then raise exception 'ఇదే శీర్షిక లేదా కథనం ఇప్పటికే ప్రచురితమైంది.' using errcode = '23505'; end if;
  return new;
end $$;
drop trigger if exists enforce_editorial_publication on public.articles;
create trigger enforce_editorial_publication before insert or update of title, content, summary, status, language, author_id, category_id, sources, editorial_reviewed, published_at, reviewer_id, cover_image, cover_alt, image_credit, content_kind, sponsor_name, original_reporting on public.articles
for each row execute function public.enforce_editorial_publication();
create index if not exists articles_te_published_date_idx on public.articles(published_at desc, id) where language = 'te' and status = 'published';
create index if not exists articles_author_date_idx on public.articles(author_id, published_at desc);
commit;
