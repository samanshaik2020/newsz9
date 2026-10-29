import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article, ArticleFormInput, Author, Category } from "@/types";
import { normalizeEditorialInput, normalizedText, publicationDates, publicationIssues } from "@/lib/editorial";
import { clearArticleCaches } from "@/lib/cache";
import { MAX_ARTICLE_TAGS, parseTagKeywords, resolveKeywordTagIds } from "@/lib/tags";

export async function saveEditorialArticle(s: SupabaseClient, request: Request, id?: string) {
  let body: Partial<ArticleFormInput> & { tag_ids?: string[]; tag_keywords?: string };
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch { return NextResponse.json({ error: "Submit valid article details." }, { status: 400 }); }
  let input: ArticleFormInput;
  try { input = normalizeEditorialInput(body); }
  catch { return NextResponse.json({ error: "Enter valid values in the article fields." }, { status: 400 }); }
  if (!input.title || !input.slug || !input.content || input.language !== "te") return NextResponse.json({ error: "A Telugu title, slug, and article content are required." }, { status: 400 });
  if (body.tag_ids !== undefined && (!Array.isArray(body.tag_ids) || body.tag_ids.some((t) => typeof t !== "string") || body.tag_ids.length > 30)) return NextResponse.json({ error: "Check the tag details." }, { status: 400 });
  if (body.tag_keywords !== undefined && typeof body.tag_keywords !== "string") return NextResponse.json({ error: "Enter keywords separated by commas." }, { status: 400 });
  const keywordTags = body.tag_keywords === undefined ? undefined : parseTagKeywords(body.tag_keywords);
  if (keywordTags && (keywordTags.length > MAX_ARTICLE_TAGS || keywordTags.some((tag) => !tag.slug))) return NextResponse.json({ error: "Use up to 30 keywords containing letters or numbers, separated by commas." }, { status: 400 });

  let existing: Article | null = null;
  if (id) {
    const result = await s.from("articles").select("*").eq("id", id).maybeSingle();
    if (result.error) return NextResponse.json({ error: "Could not load the article." }, { status: 503 });
    existing = result.data as Article | null;
    if (!existing) return NextResponse.json({ error: "Article not found." }, { status: 404 });
    // A published URL remains stable; changing it would break citations and old links.
    if (existing.published_at && input.slug !== existing.slug) return NextResponse.json({ error: "The URL of a published article must remain unchanged. Set up a permanent redirect if a change is necessary." }, { status: 422 });
  }
  if (input.status === "published") {
    const [authorResult, categoryResult] = await Promise.all([
      input.author_id ? s.from("authors").select("*").eq("id", input.author_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      input.category_id ? s.from("categories").select("*").eq("id", input.category_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (authorResult.error || categoryResult.error) return NextResponse.json({ error: "Could not verify the author or category details." }, { status: 503 });
    const issues = publicationIssues(input, authorResult.data as Author | null, categoryResult.data as Category | null);
    if (issues.length) return NextResponse.json({ error: issues.join("\n"), issues }, { status: 422 });
    const contentKey = normalizedText(input.content), titleKey = normalizedText(input.title);
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await s.from("articles").select("id,title,content").in("status", ["published", "review"]).order("id").range(offset, offset + 999);
      if (error) return NextResponse.json({ error: "Could not complete the duplicate article check. Please try again." }, { status: 503 });
      if (data.some((a) => a.id !== id && (normalizedText(a.title) === titleKey || normalizedText(a.content) === contentKey))) return NextResponse.json({ error: "An article with the same title or content already exists. Update the original article." }, { status: 409 });
      if (data.length < 1000) break;
    }
  }
  const now = new Date();
  const dates = input.status === "published" ? publicationDates(existing, now) : { published_at: existing?.published_at ?? null, updated_at: existing?.updated_at ?? now.toISOString() };
  // Metadata-only edits do not pretend that the reporting has been refreshed.
  if (existing && existing.title === input.title && existing.summary === input.summary && existing.content === input.content) dates.updated_at = existing.updated_at ?? dates.updated_at;
  const payload = { ...input, ...dates };
  const result = id ? await s.from("articles").update(payload).eq("id", id).select("id,slug").single()
    : await s.from("articles").insert(payload).select("id,slug").single();
  if (result.error) return NextResponse.json({ error: result.error.code === "23505" ? "This slug or article already exists." : "Could not save the article. Apply the editorial database migration and try again." }, { status: 400 });
  let tagWarning: string | undefined;
  if (keywordTags !== undefined || body.tag_ids !== undefined) {
    try {
      const tagIds = keywordTags === undefined ? body.tag_ids! : await resolveKeywordTagIds(s, keywordTags);
      const removed = await s.from("article_tags").delete().eq("article_id", result.data.id);
      const added = !removed.error && tagIds.length ? await s.from("article_tags").insert([...new Set(tagIds)].map((tag_id) => ({ article_id: result.data.id, tag_id }))) : null;
      if (removed.error || added?.error) throw new Error("Could not update article tags.");
    } catch { tagWarning = "Article saved; the keyword tags could not be saved. Please try saving again."; }
  }
  await clearArticleCaches({ slug: result.data.slug, previousSlug: existing?.slug, includeBreakingNews: true });
  return NextResponse.json({ article: result.data, warning: tagWarning }, { status: id ? 200 : 201 });
}
