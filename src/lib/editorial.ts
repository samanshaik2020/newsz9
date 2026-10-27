import type { Article, ArticleFormInput, ArticleListItem, Author, Category } from "../types/index.ts";
import { containsTeluguText, getImageSrc, normalizeArticleContent, slugify, stripHtml } from "./utils.ts";
import { publicAuthorName } from "./authors.ts";

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
    slug: slugify(typeof body.slug === "string" && body.slug ? body.slug : body.title ?? ""),
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

export function publicationIssues(input: ArticleFormInput, author?: Author | null, category?: Category | null, reviewer?: Author | null): string[] {
  const issues: string[] = [];
  if (input.language !== "te") issues.push("ఈ సైట్‌లో తెలుగు కథనాలు మాత్రమే ప్రచురించాలి.");
  for (const [label, value] of [["శీర్షిక", input.title], ["సారాంశం", input.summary], ["కథనం", input.content], ["చిత్ర వివరణ", input.cover_alt]] as const) {
    if (!value || !isTeluguCopy(value)) issues.push(`${label} తెలుగులో పూర్తి చేయండి.`);
  }
  // These are newsroom standards, not Google eligibility thresholds.
  const words = stripHtml(input.content).split(/\s+/).filter(Boolean).length;
  if (words < 150) issues.push("సందర్భం, ఆధారాలు, పాఠకులకు ఉపయోగపడే వివరాలతో కనీసం 150 పదాలు రాయండి. ఇది మా సంపాదకీయ ప్రమాణం.");
  if ((input.content.match(/<h2\b/gi) ?? []).length < 2) issues.push("కనీసం రెండు ఉపశీర్షికలు జోడించండి.");
  if (/<h1\b/i.test(input.content)) issues.push("కథనంలో ప్రధాన శీర్షికను మళ్లీ చేర్చవద్దు; ఉపశీర్షికలను ఉపయోగించండి.");
  if (!input.cover_image || !getImageSrc(input.cover_image)) issues.push("ప్రధాన చిత్రం జోడించండి.");
  if (!input.image_credit?.trim()) issues.push("చిత్రం మూలం, వినియోగ అనుమతి నమోదు చేయండి.");
  if (!category || category.language !== "te" || !containsTeluguText(category.name)) issues.push("తెలుగు విభాగాన్ని ఎంచుకోండి.");
  if (!author || author.role === "bot" || !isTeluguCopy(publicAuthorName(author.name)) || !author.bio || !isTeluguCopy(author.bio)) issues.push("తెలుగు పేరు, నిజమైన పరిచయం ఉన్న బాధ్యతగల రచయితను ఎంచుకోండి.");
  if (!input.sources?.length || input.sources.some((s) => !safeSourceUrl(s.url) || !isTeluguCopy(s.title))) issues.push("తెలుగు పేరుతో కనీసం ఒక తనిఖీ చేసిన మూలం లింక్ ఇవ్వండి.");
  if (!input.original_reporting || !isTeluguCopy(input.original_reporting)) issues.push("మూలాలకు అదనంగా చేసిన సొంత పరిశీలన లేదా నివేదిక వివరించండి.");
  if (!input.editorial_reviewed) issues.push("వాస్తవాలు, హక్కులు, శీర్షిక, మూలాలను మానవ సంపాదకుడు తనిఖీ చేయాలి.");
  const health = /health|ఆరోగ్య|వైద్య/i.test(`${category?.slug} ${category?.name}`);
  if (health && (!reviewer || reviewer.role === "bot" || !reviewer.credentials || !isTeluguCopy(publicAuthorName(reviewer.name)) || !reviewer.bio || !isTeluguCopy(reviewer.bio))) issues.push("ఆరోగ్య కథనానికి నిజమైన అర్హతలు, పరిచయం ఉన్న వైద్య సమీక్షకుడిని నమోదు చేయండి.");
  if (input.content_kind === "sponsored" && (!input.sponsor_name || !isTeluguCopy(input.sponsor_name))) issues.push("ప్రాయోజిత కథనానికి ప్రాయోజకుడి పేరు తెలుగులో ఇవ్వండి.");
  const inlineImages = input.content.match(/<img\b[^>]*>/gi) ?? [];
  if (inlineImages.some((tag) => !/\balt=["'][^"']*[\u0C00-\u0C7F][^"']*["']/i.test(tag))) issues.push("కథనంలోని ప్రతి చిత్రానికీ తెలుగు వివరణ ఇవ్వండి.");
  return issues;
}

export function publicationDates(existing?: Pick<Article, "published_at" | "updated_at"> | null, now = new Date()) {
  const previous = Date.parse(existing?.published_at ?? "");
  return { published_at: Number.isFinite(previous) && previous <= now.getTime() ? existing!.published_at : now.toISOString(), updated_at: now.toISOString() };
}
