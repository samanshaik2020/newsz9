import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";
import { maybeCreateClient, maybeCreateServiceClient } from "@/lib/supabase";
import { getCached } from "@/lib/cache";
import { buildAdminArticleStats } from "@/lib/article-stats";
import { isPublicArticle, isTeluguCopy, uniqueArticles } from "@/lib/editorial";
import { publicAuthor } from "@/lib/authors";
import { processArticleHtml } from "@/lib/utils";
import type { Article, ArticleListItem, AdminArticleStats, Author, BreakingNewsItem, Category, Language } from "@/types";

const articleSelect = "*,categories(*),authors!articles_author_id_fkey(id,name,bio,avatar_url,role)";
const listFields = "id,title,slug,summary,cover_image,language,status,views,published_at,created_at,updated_at,category_id,author_id";
const listSelect = `${listFields},categories(*),authors!articles_author_id_fkey(id,name,bio,avatar_url,role)`;
const publicRows = (rows: ArticleListItem[]) => uniqueArticles(rows.filter((a) => isPublicArticle(a))).map((a) => ({ ...a, authors: publicAuthor(a.authors) }));

export const getCategories = cache(async function getCategories(): Promise<Category[]> {
  noStore(); const s = maybeCreateClient(); if (!s) return [];
  return getCached("categories:all", async () => {
    const { data } = await s.from("categories").select("*").order("name");
    return (data ?? []) as Category[];
  }, 600);
});
export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  noStore(); const s = maybeCreateClient(); if (!s) return [];
  const { data } = await s.from("breaking_news").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(8);
  return ((data ?? []) as BreakingNewsItem[]).filter((b) => isTeluguCopy(b.headline) && (!b.expires_at || Date.parse(b.expires_at) > Date.now()));
}
export async function getPublishedArticles(limit = 12, offset = 0, _language?: Language): Promise<ArticleListItem[]> {
  void _language; // Legacy callers may pass a language; reader queries are Telugu-only.
  noStore(); const s = maybeCreateClient(); if (!s) return [];
  limit = Math.min(1000, Math.max(1, Number.isFinite(limit) ? Math.trunc(limit) : 12));
  offset = Math.max(0, Number.isFinite(offset) ? Math.trunc(offset) : 0);
  const rows = await getCached(`homepage:articles:v3:te:${limit}:${offset}`, async () => {
    const { data } = await s.from("articles").select(listSelect).eq("status", "published").eq("language", "te")
      .lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).order("id").range(offset, offset + limit - 1);
    return (data ?? []) as unknown as ArticleListItem[];
  }, 120);
  return publicRows(rows);
}
export async function getAllPublicArticles(): Promise<ArticleListItem[]> {
  noStore(); const s = maybeCreateClient(); if (!s) return [];
  const all: ArticleListItem[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await s.from("articles").select(`${listSelect},sources,reviewer_id,editorial_reviewed`).eq("status", "published").eq("language", "te")
      .lte("published_at", new Date().toISOString()).order("id").range(offset, offset + 999);
    let data: unknown = result.data; let error = result.error;
    if (error?.code === "42703") { const legacy = await s.from("articles").select(listSelect).eq("status", "published").eq("language", "te").lte("published_at", new Date().toISOString()).order("id").range(offset, offset + 999); data = legacy.data; error = legacy.error; }
    if (error) throw new Error("ప్రచురిత కథనాల జాబితా అందుబాటులో లేదు.");
    const batch = (data ?? []) as ArticleListItem[]; all.push(...batch); if (batch.length < 1000) break;
  }
  return publicRows(all);
}
export const getArticleBySlug = cache(async function getArticleBySlug(slug: string): Promise<Article | null> {
  noStore(); const s = maybeCreateClient(); if (!s) return null;
  const article = await getCached(`article:${slug}`, async () => {
    let { data, error } = await s.from("articles").select(`${articleSelect},reviewers:authors!articles_reviewer_id_fkey(id,name,bio,role,credentials,expertise,avatar_url)`).eq("slug", slug).eq("status", "published").eq("language", "te")
      .lte("published_at", new Date().toISOString()).maybeSingle();
    if (error?.code === "PGRST200" || error?.code === "42703") {
      ({ data, error } = await s.from("articles").select(articleSelect).eq("slug", slug).eq("status", "published").eq("language", "te").lte("published_at", new Date().toISOString()).maybeSingle());
    }
    return data as unknown as Article | null;
  }, 120);
  return article && isPublicArticle(article) && isTeluguCopy(processArticleHtml(article.content)) && (!article.summary || isTeluguCopy(article.summary)) ? { ...article, authors: publicAuthor(article.authors), reviewers: publicAuthor(article.reviewers) } : null;
});
export async function getArticlesByCategory(slug: string, _language?: Language): Promise<ArticleListItem[]> {
  void _language;
  noStore(); const s = maybeCreateClient(); if (!s) return [];
  const rows = await getCached(`category:articles:v3:${slug}:te`, async () => {
    const { data } = await s.from("articles").select(`${listFields},categories!inner(*),authors!articles_author_id_fkey(id,name,bio,avatar_url,role)`)
      .eq("status", "published").eq("language", "te").eq("categories.slug", slug).lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false }).limit(60);
    return (data ?? []) as unknown as ArticleListItem[];
  }, 120);
  return publicRows(rows);
}
export async function searchArticles(query: string): Promise<ArticleListItem[]> {
  noStore(); const s = maybeCreateClient(); const term = query.trim().slice(0, 100); if (!s || !term) return [];
  const pattern = "%" + term.replace(/[\\%_]/g, "\\$&") + "%";
  const results = await Promise.all(["title", "summary"].map((field) => s.from("articles").select(listSelect)
    .eq("status", "published").eq("language", "te").lte("published_at", new Date().toISOString()).ilike(field, pattern).limit(30)));
  return publicRows(results.flatMap(({ data }) => (data ?? []) as unknown as ArticleListItem[]));
}
export async function getTrendingArticles(limit = 5, _language?: Language): Promise<ArticleListItem[]> {
  void _language;
  noStore(); const s = maybeCreateClient(); if (!s) return [];
  const { data } = await s.from("articles").select(listSelect).eq("status", "published").eq("language", "te")
    .lte("published_at", new Date().toISOString()).order("views", { ascending: false }).limit(limit);
  return publicRows((data ?? []) as unknown as ArticleListItem[]);
}
export const getPublicAuthor = cache(async function getPublicAuthor(id: string): Promise<Author | null> {
  if (!/^[a-f\d-]{36}$/i.test(id)) return null;
  const s = maybeCreateClient(); if (!s) return null;
  let { data, error } = await s.from("authors").select("id,name,bio,avatar_url,role,credentials,expertise").eq("id", id).neq("role", "bot").maybeSingle();
  if (error?.code === "42703") ({ data, error } = await s.from("authors").select("id,name,bio,avatar_url,role").eq("id", id).neq("role", "bot").maybeSingle());
  const author = publicAuthor(data as Author | null);
  return author && isTeluguCopy(author.name) ? author : null;
});
export async function getAuthorArticles(id: string): Promise<ArticleListItem[]> {
  const s = maybeCreateClient(); if (!s) return [];
  const { data } = await s.from("articles").select(listSelect).eq("author_id", id).eq("status", "published").eq("language", "te")
    .lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).limit(30);
  return publicRows((data ?? []) as unknown as ArticleListItem[]);
}
export async function getAdminArticles(limit = 100): Promise<Article[]> {
  noStore(); const s = maybeCreateServiceClient(); if (!s) return [];
  const { data } = await s.from("articles").select(articleSelect).order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as unknown as Article[];
}
export async function getAdminArticleStats(adminCategories: Category[]): Promise<AdminArticleStats> {
  const s = maybeCreateServiceClient(); if (!s) return buildAdminArticleStats([], adminCategories);
  const rows: Article[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await s.from("articles").select("status,category_id").order("id").range(offset, offset + 999);
    if (error) throw new Error("కథనాల గణాంకాలు అందుబాటులో లేవు.");
    rows.push(...data as Article[]); if (data.length < 1000) break;
  }
  return buildAdminArticleStats(rows, adminCategories);
}
export async function getAdminArticleById(id: string): Promise<Article | null> {
  noStore(); const s = maybeCreateServiceClient(); if (!s) return null;
  const { data } = await s.from("articles").select(articleSelect).eq("id", id).maybeSingle();
  return data as unknown as Article | null;
}
export async function getAdminBreakingNews(): Promise<BreakingNewsItem[]> {
  noStore(); const s = maybeCreateServiceClient(); if (!s) return [];
  const { data } = await s.from("breaking_news").select("*").order("created_at", { ascending: false }).limit(50);
  return (data ?? []) as BreakingNewsItem[];
}
