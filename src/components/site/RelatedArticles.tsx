import Link from "next/link";
import Image from "next/image";
import { cn, containsTeluguText, formatDate, getImageSrc } from "@/lib/utils";
import type { Article } from "@/types";

function SuggestionCard({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);
  const articleHref = `/article/${article.slug}`;
  const isTelugu =
    article.language === "te" ||
    containsTeluguText(article.title) ||
    containsTeluguText(article.summary);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md",
        isTelugu && "telugu-copy",
      )}
      lang={isTelugu ? "te" : undefined}
    >
      <Link
        className="relative block aspect-[16/10] overflow-hidden bg-zinc-100"
        href={articleHref}
      >
        {imageSrc ? (
          <Image
            alt={article.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 33vw, 100vw"
            src={imageSrc}
          />
        ) : (
          <span className="grid h-full place-items-center text-xs font-black uppercase text-zinc-400">
            Newsz9
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link
          className="text-[11px] font-black uppercase tracking-wide text-red-700 hover:text-red-800"
          href={
            article.categories ? `/${article.categories.slug}` : "/search?q=News"
          }
        >
          {article.categories?.name ?? "News"}
        </Link>
        <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-zinc-950">
          <Link
            className="line-clamp-2 hover:text-red-700"
            href={articleHref}
          >
            {article.title}
          </Link>
        </h3>
        <time className="mt-auto pt-3 text-[11px] font-semibold uppercase text-zinc-400">
          {formatDate(article.published_at)}
        </time>
      </div>
    </article>
  );
}

export function RelatedArticles({
  articles,
  moreStories = [],
}: {
  articles: Article[];
  moreStories?: Article[];
}) {
  const hasRelated = articles.length > 0;
  const hasMore = moreStories.length > 0;

  if (!hasRelated && !hasMore) return null;

  return (
    <div className="border-t border-zinc-200 bg-zinc-50">
      {/* ── Related Stories (same category) ── */}
      {hasRelated ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-red-700" />
            <h2 className="text-xl font-black text-zinc-950">
              Related Stories
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((article) => (
              <SuggestionCard article={article} key={article.id} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── More Stories (trending + latest) ── */}
      {hasMore ? (
        <section
          className={cn(
            "mx-auto max-w-6xl px-4 pb-10",
            hasRelated ? "pt-0" : "py-10",
          )}
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-zinc-950" />
            <h2 className="text-xl font-black text-zinc-950">
              You May Also Like
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {moreStories.map((article) => (
              <SuggestionCard article={article} key={article.id} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
