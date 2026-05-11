"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import type { Article } from "@/types";

const previewStorageKey = "newsz9-article-preview";

export function ArticlePreviewClient() {
  const [rawArticle, setRawArticle] = useState<string | null>(null);

  useEffect(() => {
    // Read immediately on mount (covers same-tab writes via sessionStorage.setItem)
    setRawArticle(sessionStorage.getItem(previewStorageKey));

    // Also listen for cross-tab storage events
    function onStorage(event: StorageEvent) {
      if (event.key === previewStorageKey) {
        setRawArticle(event.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const article = useMemo<Article | null>(() => {
    if (!rawArticle) return null;
    try {
      return JSON.parse(rawArticle) as Article;
    } catch {
      return null;
    }
  }, [rawArticle]);

  if (!article) {
    return (
      <div className="mx-auto grid max-w-2xl gap-6 rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-zinc-100">
          <svg
            className="h-8 w-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900">No Preview Available</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Open the article editor and click <strong>Preview Page</strong> to load the
            draft here.
          </p>
        </div>
        <Link
          className="mx-auto inline-flex items-center gap-2 rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          href="/admin/articles/new"
        >
          ← Back to editor
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <TemplateRenderer article={article} />
    </div>
  );
}
