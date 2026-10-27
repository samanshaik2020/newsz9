import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article, ArticleFormInput, Author, Category } from "@/types";
import { normalizeEditorialInput, normalizedText, publicationDates, publicationIssues } from "@/lib/editorial";
import { clearArticleCaches } from "@/lib/cache";

export async function saveEditorialArticle(s: SupabaseClient, request: Request, id?: string) {
  let body: Partial<ArticleFormInput> & { tag_ids?: string[] };
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch { return NextResponse.json({ error: "సరైన కథనం వివరాలు పంపండి." }, { status: 400 }); }
  let input: ArticleFormInput;
  try { input = normalizeEditorialInput(body); }
  catch { return NextResponse.json({ error: "కథనం ఫీల్డుల్లో సరైన విలువలు ఇవ్వండి." }, { status: 400 }); }
  if (!input.title || !input.slug || !input.content || input.language !== "te") return NextResponse.json({ error: "తెలుగు శీర్షిక, లింకు పేరు, కథనం తప్పనిసరి." }, { status: 400 });
  if (body.tag_ids !== undefined && (!Array.isArray(body.tag_ids) || body.tag_ids.some((t) => typeof t !== "string") || body.tag_ids.length > 30)) return NextResponse.json({ error: "ట్యాగుల వివరాలు సరిచూడండి." }, { status: 400 });

  let existing: Article | null = null;
  if (id) {
    const result = await s.from("articles").select("*").eq("id", id).maybeSingle();
    if (result.error) return NextResponse.json({ error: "కథనాన్ని చదవలేకపోయాం." }, { status: 503 });
    existing = result.data as Article | null;
    if (!existing) return NextResponse.json({ error: "కథనం కనిపించలేదు." }, { status: 404 });
    // A published URL remains stable; changing it would break citations and old links.
    if (existing.published_at && input.slug !== existing.slug) return NextResponse.json({ error: "ప్రచురించిన కథనం లింకును మార్చవద్దు. అవసరమైతే శాశ్వత దారి మళ్లింపు ఏర్పాటు చేయాలి." }, { status: 422 });
  }
  if (input.status === "published") {
    const [authorResult, categoryResult, reviewerResult] = await Promise.all([
      input.author_id ? s.from("authors").select("*").eq("id", input.author_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      input.category_id ? s.from("categories").select("*").eq("id", input.category_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      input.reviewer_id ? s.from("authors").select("*").eq("id", input.reviewer_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (authorResult.error || categoryResult.error || reviewerResult.error) return NextResponse.json({ error: "రచయిత, విభాగం, సమీక్ష వివరాలు తనిఖీ కాలేదు." }, { status: 503 });
    const issues = publicationIssues(input, authorResult.data as Author | null, categoryResult.data as Category | null, reviewerResult.data as Author | null);
    if (existing?.status === "published" && existing.content !== input.content && !input.correction_note?.trim()) issues.push("ఇప్పటికే ప్రచురించిన కథనం మార్పుకు సవరణ లేదా నవీకరణ గమనిక ఇవ్వండి.");
    if (issues.length) return NextResponse.json({ error: issues.join("\n"), issues }, { status: 422 });
    const contentKey = normalizedText(input.content), titleKey = normalizedText(input.title);
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await s.from("articles").select("id,title,content").in("status", ["published", "review"]).order("id").range(offset, offset + 999);
      if (error) return NextResponse.json({ error: "నకిలీ కథనాల తనిఖీ పూర్తి కాలేదు. మళ్లీ ప్రయత్నించండి." }, { status: 503 });
      if (data.some((a) => a.id !== id && (normalizedText(a.title) === titleKey || normalizedText(a.content) === contentKey))) return NextResponse.json({ error: "ఇదే శీర్షిక లేదా కథనం ఇప్పటికే ఉంది. అసలు కథనాన్ని నవీకరించండి." }, { status: 409 });
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
  if (result.error) return NextResponse.json({ error: result.error.code === "23505" ? "ఈ లింకు లేదా కథనం ఇప్పటికే ఉంది." : "కథనం భద్రపరచలేకపోయాం. డేటాబేస్ సంపాదకీయ నవీకరణను అమలు చేసి మళ్లీ ప్రయత్నించండి." }, { status: 400 });
  let tagWarning: string | undefined;
  if (body.tag_ids !== undefined) {
    const removed = await s.from("article_tags").delete().eq("article_id", result.data.id);
    const added = !removed.error && body.tag_ids.length ? await s.from("article_tags").insert([...new Set(body.tag_ids)].map((tag_id) => ({ article_id: result.data.id, tag_id }))) : null;
    if (removed.error || added?.error) tagWarning = "కథనం భద్రపడింది; ట్యాగులు మళ్లీ తనిఖీ చేయండి.";
  }
  await clearArticleCaches({ slug: result.data.slug, previousSlug: existing?.slug, includeBreakingNews: true });
  return NextResponse.json({ article: result.data, warning: tagWarning }, { status: id ? 200 : 201 });
}
