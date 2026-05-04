import Link from "next/link";
import type { Article } from "@/types";

export function Sidebar({ articles }: { articles: Article[] }) {
  return (
    <aside className="grid content-start gap-6">
      <section className="border border-zinc-200 bg-white">
        <h2 className="border-b-2 border-zinc-950 bg-zinc-50 px-4 py-3 text-sm font-black uppercase">
          Trending
        </h2>
        <div className="grid">
          {articles.map((article, index) => (
            <Link
              className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-zinc-200 px-4 py-4 text-sm font-bold leading-6 last:border-b-0 hover:text-red-600"
              href={`/article/${article.slug}`}
              key={article.id}
            >
              <span className="font-black text-red-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{article.title}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid min-h-64 place-items-center border border-zinc-200 bg-zinc-50 p-6 text-center text-xs font-black uppercase text-zinc-500">
        Advertisement
      </section>
    </aside>
  );
}
