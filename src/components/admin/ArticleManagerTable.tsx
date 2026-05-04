"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";

export function ArticleManagerTable({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function deleteArticle(article: Article) {
    if (!confirm(`Delete "${article.title}" permanently?`)) return;

    setDeletingId(article.id);
    setMessage(null);

    const response = await fetch(`/api/admin/articles/${article.id}`, {
      method: "DELETE",
    });
    const payload = (await response.json()) as { error?: string };

    setDeletingId(null);

    if (!response.ok) {
      setMessage(payload.error ?? "Article could not be deleted.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-3">
      {message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div className="hidden border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-500 md:grid md:grid-cols-[1fr_150px_110px_130px_230px]">
          <span>Title</span>
          <span>Category</span>
          <span>Status</span>
          <span>Date</span>
          <span className="text-right">Actions</span>
        </div>
        {articles.length ? (
          articles.map((article) => (
            <div
              className="grid gap-3 border-b border-zinc-200 p-4 last:border-b-0 md:grid-cols-[1fr_150px_110px_130px_230px] md:items-center"
              key={article.id}
            >
              <div>
                <p className="font-bold">{article.title}</p>
                <p className="mt-1 text-xs text-zinc-500">/{article.slug}</p>
              </div>
              <span className="text-sm text-zinc-500">
                {article.categories?.name ?? "No category"}
              </span>
              <span className="w-fit rounded bg-zinc-100 px-2 py-1 text-xs font-bold capitalize text-zinc-700">
                {article.status}
              </span>
              <span className="text-sm text-zinc-500">
                {formatDate(article.published_at ?? article.created_at)}
              </span>
              <span className="flex flex-wrap gap-2 md:justify-end">
                <Button asChild size="sm" type="button" variant="outline">
                  <Link href={`/admin/articles/${article.id}`}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
                <Button asChild size="sm" type="button" variant="outline">
                  <Link href={`/admin/articles/${article.id}/preview`}>
                    <Eye aria-hidden="true" />
                    Preview
                  </Link>
                </Button>
                <Button
                  disabled={deletingId === article.id}
                  onClick={() => deleteArticle(article)}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  <Trash2 aria-hidden="true" />
                  {deletingId === article.id ? "Deleting" : "Delete"}
                </Button>
              </span>
            </div>
          ))
        ) : (
          <p className="p-6 text-sm text-zinc-600">No articles found.</p>
        )}
      </div>
    </div>
  );
}
