"use client";

import { useState } from "react";
import { ArticleGrid } from "./ArticleGrid";
import type { Article } from "@/types";

export function InfiniteArticleGrid({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const offset = articles.length + 6; // +6 because the initial list has 6 articles (the 6 latest not including the lead) plus the lead.
      // Actually, wait, initialArticles length is 6 here. The offset should be 7 (1 lead + 6 grid).
      // If we pass in initialArticles of length 6, we've loaded 7 articles total.
      const actualOffset = articles.length + 1; 
      const response = await fetch(`/api/articles?limit=12&offset=${actualOffset}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      
      const data = await response.json();
      if (data.articles.length < 12) {
        setHasMore(false);
      }
      
      setArticles((prev) => [...prev, ...data.articles]);
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
            className="rounded-lg border border-zinc-200 bg-white px-8 py-3 font-bold text-zinc-900 transition-colors hover:bg-zinc-50 hover:text-red-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}
