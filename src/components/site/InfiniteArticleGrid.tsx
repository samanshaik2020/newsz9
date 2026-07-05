"use client";

import { useState } from "react";
import { ArticleGrid } from "./ArticleGrid";
import type { Article, Language } from "@/types";

export function InfiniteArticleGrid({
  initialArticles,
  language,
  nextOffset,
}: {
  initialArticles: Article[];
  language?: Language;
  nextOffset?: number;
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length >= 9);
  const [offset, setOffset] = useState(nextOffset ?? initialArticles.length + 1);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "12",
        offset: String(offset),
      });

      if (language) {
        params.set("lang", language);
      }

      const response = await fetch(`/api/articles?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      
      const data = await response.json();
      if (data.articles.length < 12) {
        setHasMore(false);
      }
      
      setArticles((prev) => [...prev, ...data.articles]);
      setOffset((current) => current + data.articles.length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ArticleGrid articles={articles} />
      
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-sm bg-[var(--color-news-red)] px-8 py-3 text-sm font-black uppercase text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}
