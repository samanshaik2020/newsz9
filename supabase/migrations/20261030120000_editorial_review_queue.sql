-- Apply after 20261030_article_metadata_storage.sql.
-- Restore the admin audit query without rewriting articles or publication rules.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create or replace view public.editorial_review_queue
with (security_invoker = true) as
select
  a.id,
  a.slug,
  a.title,
  a.status,
  a.language <> 'te' as non_telugu,
  a.published_at > now() as future_date,
  not a.editorial_reviewed as needs_review,
  (a.author_id is null or au.role = 'bot' or nullif(au.bio, '') is null) as needs_author,
  case when jsonb_typeof(a.sources) = 'array'
    then jsonb_array_length(a.sources) = 0
    else true
  end as needs_sources,
  nullif(a.cover_alt, '') is null as needs_image_description,
  (
    select count(*) > 1
    from public.articles b
    where b.status = 'published'
      and lower(regexp_replace(b.title, '[[:space:][:punct:]]+', '', 'g'))
        = lower(regexp_replace(a.title, '[[:space:][:punct:]]+', '', 'g'))
  ) as repeated_title
from public.articles a
left join public.authors au on au.id = a.author_id;

revoke all on public.editorial_review_queue from public, anon, authenticated;
grant select on public.editorial_review_queue to service_role;
notify pgrst, 'reload schema';
commit;
