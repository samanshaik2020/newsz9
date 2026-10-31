import type { Article, ArticleFormInput, ArticleListItem, Category, EditorialFields } from "../types/index.ts";
import { getImageSrc, normalizeArticleContent, slugify, stripHtml } from "./utils.ts";
import { generateArticleSlug } from "./article-slug.ts";

export function normalizedText(value: string) {
  return stripHtml(value).normalize("NFKC").replace(/&(?:nbsp|amp|quot|lt|gt);|&#(?:\d+|x[\da-f]+);/gi, " ")
    .toLocaleLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();
}

export function isTeluguCopy(value: string) {
  const text = stripHtml(value).replace(/https?:\/\/\S+/g, "");
  const telugu = (text.match(/[\u0C00-\u0C7F]/g) ?? []).length;
  const latin = (text.match(/[a-z]/gi) ?? []).length;
  return telugu > 0 && telugu / (telugu + latin) >= 0.85;
}

export function isPublicArticle(article: Pick<Article, "language" | "status" | "published_at" | "title">, now = Date.now()) {
  const published = Date.parse(article.published_at ?? "");
  return article.language === "te" && article.status === "published" &&
    Number.isFinite(published) && published <= now && isTeluguCopy(article.title);
}

export function uniqueArticles<T extends ArticleListItem>(articles: T[]): T[] {
  const ids = new Set<string>(), slugs = new Set<string>(), titles = new Set<string>();
  return articles.filter((article) => {
    const title = normalizedText(article.title);
    if (ids.has(article.id) || slugs.has(article.slug) || titles.has(title)) return false;
    ids.add(article.id); slugs.add(article.slug); titles.add(title); return true;
  });
}

export function composeHomepage(articles: ArticleListItem[], categories: Category[]) {
  const pool = uniqueArticles(articles);
  const lead = pool.shift();
  const top = pool.splice(0, 4);
  const latest = pool.splice(0, 6);
  const sections = categories.filter((c) => c.language === "te").map((category) => {
    const items = pool.filter((a) => a.categories?.slug === category.slug).slice(0, 3);
    const ids = new Set(items.map((a) => a.id));
    for (let i = pool.length - 1; i >= 0; i--) if (ids.has(pool[i].id)) pool.splice(i, 1);
    return { category, articles: items };
  }).filter((section) => section.articles.length);
  return { lead, top, latest, sections, trending: pool.sort((a, b) => b.views - a.views).slice(0, 5) };
}

export function safeSourceUrl(value?: string | null) {
  try { const url = new URL(value ?? ""); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}

export function normalizeEditorialInput(body: Partial<ArticleFormInput>): ArticleFormInput {
  return {
    title: typeof body.title === "string" ? body.title.trim() : "",
    slug: typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : generateArticleSlug(body.title ?? ""),
    summary: typeof body.summary === "string" ? body.summary.trim() : "",
    content: normalizeArticleContent(typeof body.content === "string" ? body.content : ""),
    cover_image: getImageSrc(body.cover_image), cover_alt: body.cover_alt?.trim() || null,
    image_credit: body.image_credit?.trim() || null,
    enable_gallery: Boolean(body.enable_gallery),
    gallery_images: Array.isArray(body.gallery_images) ? body.gallery_images.map(getImageSrc).filter((s): s is string => Boolean(s)) : [],
    language: body.language ?? "te", template: ["template_1", "template_2", "template_3", "template_4"].includes(body.template ?? "") ? body.template! : "template_1",
    status: ["draft", "review", "published", "archived"].includes(body.status ?? "") ? body.status! : "draft",
    category_id: body.category_id || null, author_id: body.author_id || null,
    source_url: safeSourceUrl(body.source_url),
    sources: Array.isArray(body.sources) ? body.sources.slice(0, 20).filter((s) => s && typeof s.title === "string" && typeof s.url === "string").map((s) => ({ title: s.title.trim(), url: safeSourceUrl(s.url) ?? "" })) : [],
    original_reporting: body.original_reporting?.trim() || null,
    editorial_reviewed: body.editorial_reviewed === true,
    ai_assisted: body.ai_assisted === true,
    reviewer_id: body.reviewer_id || null,
    content_kind: ["news", "analysis", "opinion", "sponsored"].includes(body.content_kind ?? "") ? body.content_kind! : "news",
    sponsor_name: body.sponsor_name?.trim() || null,
    correction_note: body.correction_note?.trim() || null,
  };
}

export function publicationIssues(input: ArticleFormInput): string[] {
  const issues: string[] = [];
  if (input.language !== "te") issues.push("Only Telugu articles can be published on this site.");
  for (const [label, value] of [["Title", input.title], ["Full Article", input.content]] as const) {
    if (!stripHtml(value).trim()) issues.push(`${label} is required.`);
    else if (!isTeluguCopy(value)) issues.push(`${label} must be in Telugu.`);
  }
  if (input.summary?.trim() && !isTeluguCopy(input.summary)) issues.push("Summary must be in Telugu when provided.");
  return issues;
}

type ArticleWriteInput = ArticleFormInput & Pick<Article, "published_at" | "updated_at">;

export function articleWritePayload(input: ArticleWriteInput, existing?: Article | null): ArticleWriteInput {
  const payload = { ...input };
  const metadataKeys: (keyof EditorialFields)[] = ["cover_alt", "image_credit", "sources", "original_reporting", "editorial_reviewed", "ai_assisted", "reviewer_id", "content_kind", "sponsor_name", "correction_note"];
  for (const key of metadataKeys) {
    const value = payload[key];
    const usesDefault = value == null || value === "" || value === false || (Array.isArray(value) && value.length === 0) || (key === "content_kind" && value === "news");
    // Defaults need no database column on a legacy schema. Existing fields remain
    // explicit on edits so clearing saved metadata still works.
    if (usesDefault && (!existing || !Object.hasOwn(existing, key))) delete payload[key];
  }
  return payload;
}

export function articleSaveFailure(error: { code?: string }) {
  switch (error.code) {
    case "23505":
      return { status: 409, error: "This slug or article already exists." };
    case "23503":
      return { status: 422, error: "The selected author, category, or reviewer is no longer available. Please select an available option and try again." };
    case "42501":
      return { status: 403, error: "The database did not allow this article to be saved. Please contact the site administrator." };
    case "PGRST204":
    case "42703":
      return { status: 503, error: "The article storage update is incomplete. Your writing is still in the editor. Please contact the site administrator." };
    case "23502":
    case "23514":
    case "22P02":
    case "P0001":
      return { status: 422, error: "The database rejected some article details. Please check the fields and try again." };
    default:
      return { status: 500, error: "Could not save the article. Please try again. If the problem continues, contact the site administrator." };
  }
}

export function publicationDates(existing?: Pick<Article, "published_at" | "updated_at"> | null, now = new Date()) {
  const previous = Date.parse(existing?.published_at ?? "");
  return { published_at: Number.isFinite(previous) && previous <= now.getTime() ? existing!.published_at : now.toISOString(), updated_at: now.toISOString() };
}
