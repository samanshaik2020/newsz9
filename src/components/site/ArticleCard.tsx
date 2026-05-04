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
  const articleHref = `/article/${article.slug}`;

  return (
    <article className="group grid grid-cols-[116px_minmax(0,1fr)] gap-3 border-b border-zinc-200 py-4 sm:grid-cols-1">
      <Link
        className="relative block aspect-[4/3] overflow-hidden bg-zinc-100 sm:aspect-[16/10]"
        href={articleHref}
      >
        {imageSrc ? (
          <Image
            alt={article.title}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            fill
            priority={priority}
            sizes="(min-width: 1280px) 260px, (min-width: 640px) 45vw, 116px"
            src={imageSrc}
          />
        ) : (
          <span className="grid h-full place-items-center text-xs font-semibold uppercase text-zinc-500">
            News
          </span>
        )}
      </Link>
      <div className="min-w-0">
        <div className="category-label mb-1 flex items-center gap-2 text-[11px] font-bold uppercase text-red-600">
          <span>{article.categories?.name ?? "News"}</span>
          <span className="text-zinc-300">|</span>
          <time className="text-zinc-500">{formatDate(article.published_at)}</time>
        </div>
        <h2 className="text-[15px] font-black leading-snug text-zinc-950 sm:text-[17px]">
          <Link className="hover:text-red-600" href={articleHref}>
            {article.title}
          </Link>
        </h2>
        {article.summary ? (
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600">
            {article.summary}
          </p>
        ) : null}
      </div>
    </article>
  );
}
