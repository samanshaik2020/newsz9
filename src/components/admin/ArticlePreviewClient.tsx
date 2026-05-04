"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import type { Article } from "@/types";

const previewStorageKey = "newsz9-article-preview";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return sessionStorage.getItem(previewStorageKey);
}

function getServerSnapshot() {
  return null;
}

export function ArticlePreviewClient() {
  const rawArticle = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const article = useMemo(() => {
    if (!rawArticle) return null;

    try {
      return JSON.parse(rawArticle) as Article;
    } catch {
      return null;
    }
  }, [rawArticle]);

  if (!article) {
    return (
      <div className="mx-auto grid max-w-2xl gap-4 rounded-md border border-zinc-200 bg-white p-6 text-center">
        <h1 className="text-2xl font-black">No Preview Available</h1>
        <p className="text-sm leading-6 text-zinc-600">
          Open the preview from the article editor so the latest draft content
          can be loaded here.
        </p>
        <Link
          className="mx-auto rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
          href="/admin/articles/new"
        >
          Back to editor
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-white shadow-sm">
      <TemplateRenderer article={article} />
    </div>
  );
}
