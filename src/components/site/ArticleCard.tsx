import Image from "next/image";
import Link from "next/link";
import { cn, containsTeluguText, formatDate, getImageSrc } from "@/lib/utils";
import type { ArticleListItem } from "@/types";
import { VerifiedAuthor } from "./VerifiedAuthor";

export function ArticleCard({
  article,
  priority = false,
  showExcerpt = true,
}: {
  article: ArticleListItem;
  priority?: boolean;
  showExcerpt?: boolean;
}) {
  const imageSrc = getImageSrc(article.cover_image);
  const articleHref = `/article/${article.slug}`;
  const isTelugu =
    article.language === "te" ||
    containsTeluguText(article.title) ||
    containsTeluguText(article.summary);

  return (
    <article
      className={cn(
        "group flex h-full flex-col border-b border-zinc-200 pb-5",
        isTelugu && "telugu-copy",
      )}
      lang={isTelugu ? "te" : undefined}
    >
      <Link
        className="relative block aspect-[16/10] overflow-hidden rounded-sm bg-zinc-100"
        href={articleHref}
      >
        {imageSrc ? (
          <Image
            alt={article.title}
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
            fill
            priority={priority}
            sizes="(min-width: 1280px) 250px, (min-width: 768px) 33vw, 100vw"
            src={imageSrc}
          />
        ) : (
          <span className="grid h-full place-items-center text-xs font-black uppercase text-zinc-500">
            Newsz9
          </span>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <Link
          className="category-label text-[11px] font-black uppercase text-[var(--color-news-red)] hover:text-red-800"
          href={article.categories ? `/${article.categories.slug}` : "/search?q=News"}
        >
          {article.categories?.name ?? "News"}
        </Link>
        <h2 className="mt-1 text-[17px] font-black leading-snug text-zinc-950">
          <Link className="line-clamp-2 hover:text-[var(--color-news-red)]" href={articleHref}>
            {article.title}
          </Link>
        </h2>
        {showExcerpt && article.summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
            {article.summary}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-zinc-500">
          <VerifiedAuthor
            className="max-w-[70%] text-xs"
            name={article.authors?.name ?? "newsz9 Desk"}
          />
          <time
            className="font-semibold uppercase"
            dateTime={article.published_at ?? article.created_at}
          >
            {formatDate(article.published_at ?? article.created_at)}
          </time>
        </div>
      </div>
    </article>
  );
}
