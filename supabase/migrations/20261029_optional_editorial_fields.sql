-- Keep publishing rules aligned with the simplified article form.
-- Existing sources, research, reviews, and correction notes are preserved.
begin;
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
create or replace function public.enforce_editorial_publication()
returns trigger language plpgsql set search_path = public, extensions as $$
declare title_key text; body_key text; selected_author public.authors; selected_category public.categories;
begin
  if new.status <> 'published' then return new; end if;
  if new.language <> 'te' or new.title !~ '[ఀ-౿]' then raise exception 'Only Telugu articles can be published.'; end if;
  if new.published_at is null or new.published_at > now() then raise exception 'A valid publication time is required.'; end if;
  if TG_OP = 'UPDATE' and old.published_at is not null and old.published_at <= now() and new.published_at is distinct from old.published_at then
    raise exception 'The original publication date must remain unchanged.';
  end if;
  select * into selected_author from public.authors where id = new.author_id;
  select * into selected_category from public.categories where id = new.category_id;
  if selected_author.id is null or selected_author.role = 'bot' or coalesce(selected_author.bio, '') !~ '[ఀ-౿]' then raise exception 'An author with an accurate biography is required.'; end if;
  if selected_category.id is null or selected_category.language <> 'te' then raise exception 'A Telugu category is required.'; end if;
  if not new.editorial_reviewed then raise exception 'Human editorial review is required.'; end if;
  if nullif(new.cover_image, '') is null or coalesce(new.cover_alt, '') !~ '[ఀ-౿]' or nullif(new.image_credit, '') is null then raise exception 'A cover image, Telugu description, and usage rights are required.'; end if;
  if new.content_kind not in ('news', 'analysis', 'opinion', 'sponsored') then raise exception 'Check the article type.'; end if;
  if new.content_kind = 'sponsored' and nullif(new.sponsor_name, '') is null then raise exception 'The sponsor must be disclosed.'; end if;
  title_key := lower(regexp_replace(new.title, '[[:space:][:punct:]]+', '', 'g'));
  body_key := lower(regexp_replace(regexp_replace(new.content, '<[^>]*>', '', 'g'), '[[:space:][:punct:]]+', '', 'g'));
  perform pg_advisory_xact_lock(2099271027);
  if exists(select 1 from public.articles a where a.id <> new.id and a.status = 'published' and (
    lower(regexp_replace(a.title, '[[:space:][:punct:]]+', '', 'g')) = title_key or
    lower(regexp_replace(regexp_replace(a.content, '<[^>]*>', '', 'g'), '[[:space:][:punct:]]+', '', 'g')) = body_key
  )) then raise exception 'An article with the same title or content is already published.' using errcode = '23505'; end if;
  return new;
end $$;
drop trigger if exists enforce_editorial_publication on public.articles;
create trigger enforce_editorial_publication before insert or update of title, content, summary, status, language, author_id, category_id, sources, editorial_reviewed, published_at, reviewer_id, cover_image, cover_alt, image_credit, content_kind, sponsor_name, original_reporting on public.articles
for each row execute function public.enforce_editorial_publication();
notify pgrst, 'reload schema';
commit;
