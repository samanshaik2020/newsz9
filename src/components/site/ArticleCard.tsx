import Image from "next/image";
import Link from "next/link";
import { formatDate, getImageSrc } from "@/lib/utils";
import type { Article } from "@/types";

export function ArticleCard({
  article,
  priority = false,
}: {
  article: Article;
  priority?: boolean;
}) {
  const imageSrc = getImageSrc(article.cover_image);

  return (
    <article className="group grid gap-3 border-b border-zinc-200 pb-5">
      <Link
        className="relative block aspect-[16/10] overflow-hidden rounded-md bg-zinc-100"
        href={`/article/${article.slug}`}
      >
        {imageSrc ? (
          <Image
            alt={article.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, 100vw"
            src={imageSrc}
          />
        ) : null}
      </Link>
      <div className="grid gap-2">
        <div className="category-label flex items-center gap-2 text-xs font-semibold uppercase text-red-700">
          <span>{article.categories?.name ?? "News"}</span>
          <span className="text-zinc-400">/</span>
          <time className="text-zinc-500">{formatDate(article.published_at)}</time>
        </div>
        <h2 className="text-lg font-bold leading-snug text-zinc-950">
          <Link className="hover:text-red-700" href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h2>
        {article.summary ? (
          <p className="line-clamp-3 text-sm leading-6 text-zinc-600">
            {article.summary}
          </p>
        ) : null}
      </div>
    </article>
  );
}
