import Link from "next/link";
import type { Article } from "@/types";

export function Sidebar({ articles }: { articles: Article[] }) {
  return (
    <aside className="grid content-start gap-6">
      <section className="border border-zinc-200 p-4">
        <h2 className="border-b border-zinc-200 pb-3 text-sm font-black uppercase tracking-[0.18em]">
          Trending
        </h2>
        <div className="mt-4 grid gap-4">
          {articles.map((article, index) => (
            <Link
              className="grid grid-cols-[2rem_1fr] gap-3 text-sm font-semibold leading-6 hover:text-red-700"
              href={`/article/${article.slug}`}
              key={article.id}
            >
              <span className="font-black text-red-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{article.title}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="grid min-h-72 place-items-center border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Ad zone
      </section>
    </aside>
  );
}
