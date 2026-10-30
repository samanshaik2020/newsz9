-- Storage compatibility for the optional article fields used by the editor.
-- Add columns only: preserve existing articles, policies, and publication rules.
begin;
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
notify pgrst, 'reload schema';
commit;
