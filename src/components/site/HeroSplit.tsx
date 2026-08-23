import Image from "next/image";
import Link from "next/link";
import { cn, containsTeluguText, formatDate, getImageSrc } from "@/lib/utils";
import type { ArticleListItem } from "@/types";
import { VerifiedAuthor } from "./VerifiedAuthor";

function CompactHeroItem({ article }: { article: ArticleListItem }) {
  const imageSrc = getImageSrc(article.cover_image);
  const isTelugu =
    article.language === "te" ||
    containsTeluguText(article.title) ||
    containsTeluguText(article.summary);

  return (
    <article
      className={cn(
        "group grid grid-cols-[112px_minmax(0,1fr)] gap-3 border-b border-zinc-200 py-3 last:border-b-0",
        isTelugu && "telugu-copy",
      )}
      lang={isTelugu ? "te" : undefined}
    >
      <Link
        className="relative block aspect-[16/10] overflow-hidden rounded-sm bg-zinc-100"
        href={`/article/${article.slug}`}
      >
        {imageSrc ? (
          <Image
            alt={article.title}
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
            fill
            sizes="112px"
            src={imageSrc}
          />
        ) : (
          <span className="grid h-full place-items-center text-[10px] font-black uppercase text-zinc-500">
            News
          </span>
        )}
      </Link>
      <div className="min-w-0">
        <p className="category-label text-[10px] font-black uppercase text-[var(--color-news-red)]">
          {article.categories?.name ?? "News"}
        </p>
        <h3 className="mt-1 text-sm font-black leading-snug text-zinc-950">
          <Link className="line-clamp-3 hover:text-[var(--color-news-red)]" href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        <VerifiedAuthor
          className="mt-2 max-w-full text-[11px]"
          name={article.authors?.name ?? "newsz9 Desk"}
        />
      </div>
    </article>
  );
}

export function HeroSplit({
  featured,
  sideArticles,
}: {
  featured: ArticleListItem;
  sideArticles: ArticleListItem[];
}) {
  const imageSrc = getImageSrc(featured.cover_image);
  const isTelugu =
    featured.language === "te" ||
    containsTeluguText(featured.title) ||
    containsTeluguText(featured.summary);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]">
      <article
        className={cn("group border-b border-zinc-200 pb-5", isTelugu && "telugu-copy")}
        lang={isTelugu ? "te" : undefined}
      >
        <Link
          className="relative block aspect-[16/10] overflow-hidden rounded-sm bg-zinc-100"
          href={`/article/${featured.slug}`}
        >
          {imageSrc ? (
            <Image
              alt={featured.title}
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              fill
              priority
              sizes="(min-width: 1024px) 760px, 100vw"
              src={imageSrc}
            />
          ) : (
            <span className="grid h-full place-items-center text-sm font-black uppercase text-zinc-500">
              Newsz9
            </span>
          )}
          <span className="category-label absolute left-3 top-3 bg-[var(--color-news-red)] px-2.5 py-1 text-[11px] font-black uppercase text-white">
            {featured.categories?.name ?? "Top Story"}
          </span>
        </Link>
        <h1 className="mt-4 text-2xl font-black leading-tight text-zinc-950 sm:text-4xl">
          <Link className="line-clamp-2 hover:text-[var(--color-news-red)]" href={`/article/${featured.slug}`}>
            {featured.title}
          </Link>
        </h1>
        {featured.summary ? (
          <p className="mt-2 line-clamp-2 text-base leading-7 text-zinc-700">
            {featured.summary}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <VerifiedAuthor name={featured.authors?.name ?? "newsz9 Desk"} />
          <span aria-hidden="true">|</span>
          <time dateTime={featured.published_at ?? featured.created_at}>
            {formatDate(featured.published_at ?? featured.created_at)}
          </time>
        </div>
      </article>

      <div className="border-t-[3px] border-[var(--color-news-red)] bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 py-2">
          <h2 className="section-heading__title border-l-0 pl-0 text-lg">
            Top Stories
          </h2>
          <Link className="section-heading__link" href="/search?q=Top%20Stories">
            View More
          </Link>
        </div>
        <div>
          {sideArticles.slice(0, 5).map((article) => (
            <CompactHeroItem article={article} key={article.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
