import type { Article } from "@/types";
import { ArticleCard } from "./ArticleCard";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-10">
      <div className="border-t-2 border-zinc-950 pt-1">
        <div className="flex items-end justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2">
          <h2 className="text-xl font-black">Related Stories</h2>
        </div>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
