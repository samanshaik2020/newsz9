import { unstable_noStore as noStore } from "next/cache";
import { maybeCreateClient, maybeCreateServiceClient } from "@/lib/supabase";
import { getCached } from "@/lib/cache";
import { articles, breakingNews, categories } from "@/lib/sample-data";
import type { Article, ArticleFormInput, BreakingNewsItem, Category } from "@/types";

const articleSelect = "*, categories(*), authors(*)";

function byNewest(a: Article, b: Article) {
  return (
    new Date(b.published_at ?? b.created_at).getTime() -
    new Date(a.published_at ?? a.created_at).getTime()
  );
}

export async function getCategories(): Promise<Category[]> {
  noStore();
  const supabase = maybeCreateClient();

  if (!supabase) return categories;

  return getCached(
    "categories:all",
    async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error || !data) return categories;
      return data as Category[];
    },
    600 // cache 10 minutes
  );
}

export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  noStore();
  const supabase = maybeCreateClient();

  if (!supabase) return breakingNews;

  return getCached(
    "breaking:news",
    async () => {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error || !data) return breakingNews;
      return data as BreakingNewsItem[];
    },
    60 // cache 1 minute
  );
}

export async function getPublishedArticles(limit = 12, offset = 0): Promise<Article[]> {
  noStore();
  const supabase = maybeCreateClient();

  if (!supabase) return articles.slice().sort(byNewest).slice(offset, offset + limit);

  return getCached(
    `homepage:articles:${limit}:${offset}`,
    async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(articleSelect)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error || !data) return articles.slice().sort(byNewest).slice(offset, offset + limit);
      return data as Article[];
    },
    300 // cache 5 minutes
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  noStore();
  const supabase = maybeCreateClient();

  if (!supabase) {
    return articles.find((article) => article.slug === slug) ?? null;
  }

  return getCached(
    `article:${slug}`,
    async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(articleSelect)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !data) {
        return articles.find((article) => article.slug === slug) ?? null;
      }

      return data as Article;
    },
    1800 // cache 30 minutes
  );
}

export async function getArticlesByCategory(slug: string): Promise<Article[]> {
  noStore();
  const supabase = maybeCreateClient();

  if (!supabase) {
    return articles
      .filter((article) => article.categories?.slug === slug)
      .sort(byNewest);
  }

  return getCached(
    `category:${slug}`,
    async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(articleSelect)
        .eq("status", "published")
        .eq("categories.slug", slug)
        .order("published_at", { ascending: false });

      if (error || !data) {
        return articles
          .filter((article) => article.categories?.slug === slug)
          .sort(byNewest);
      }

      return data as Article[];
    },
    300 // cache 5 minutes
  );
}

export async function searchArticles(query: string): Promise<Article[]> {
  noStore();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = maybeCreateClient();

  if (!supabase) {
    const needle = trimmed.toLowerCase();
    return articles.filter((article) =>
      [article.title, article.summary ?? "", article.content]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  // Search results are not cached — they are too dynamic
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("status", "published")
    .textSearch("search_vector", trimmed)
    .limit(20);

  if (error || !data) return [];
  return data as Article[];
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  return getCached(
    `trending:articles:${limit}`,
    async () => {
      const allArticles = await getPublishedArticles(20);
      return allArticles.slice().sort((a, b) => b.views - a.views).slice(0, limit);
    },
    600 // cache 10 minutes
  );
}

export async function getAdminArticles(limit = 100): Promise<Article[]> {
  noStore();
  const supabase = maybeCreateServiceClient();

  if (!supabase) return articles.slice().sort(byNewest).slice(0, limit);

  // Admin data is NOT cached — always fresh
  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return articles.slice().sort(byNewest).slice(0, limit);
  return data as Article[];
}

export async function getAdminArticleById(id: string): Promise<Article | null> {
  noStore();
  const supabase = maybeCreateServiceClient();

  if (!supabase) return articles.find((article) => article.id === id) ?? null;

  const { data, error } = await supabase
    .from("articles")
    .select(articleSelect)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function getAdminBreakingNews(): Promise<BreakingNewsItem[]> {
  noStore();
  const supabase = maybeCreateServiceClient();

  if (!supabase) return breakingNews;

  const { data, error } = await supabase
    .from("breaking_news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return breakingNews;
  return data as BreakingNewsItem[];
}

export async function createArticle(input: ArticleFormInput) {
  const supabase = maybeCreateClient();

  if (!supabase) {
    return {
      error:
        "Supabase is not configured yet. Add credentials to .env.local before saving articles.",
    };
  }

  const { error } = await supabase.from("articles").insert({
    ...input,
    published_at:
      input.status === "published" ? new Date().toISOString() : null,
  });

  return { error: error?.message ?? null };
}
