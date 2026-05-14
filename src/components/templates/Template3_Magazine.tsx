import Image from "next/image";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template3({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <div className="relative mb-8 aspect-[16/7] overflow-hidden rounded-md bg-zinc-100 shadow-sm">
        {imageSrc ? (
          <Image alt={article.title} className="object-cover" fill priority src={imageSrc} />
        ) : null}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="news-label rounded bg-red-700 px-3 py-1 text-xs font-black uppercase text-white">
            {article.categories?.name ?? "News"}
          </span>
          <span className="text-sm text-zinc-500">{formatDate(article.published_at)}</span>
        </div>
        <h1 className="text-4xl font-black leading-tight text-zinc-950 md:text-6xl">
          {article.title}
        </h1>
        {article.summary ? (
          <p className="text-xl font-semibold leading-8 text-zinc-600">
            {article.summary}
          </p>
        ) : null}
        <div className="border-b border-zinc-200 pb-4 text-sm text-zinc-500">
          By {article.authors?.name ?? "newsz9 Desk"}
        </div>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: processArticleHtml(article.content) }}
        />
      </div>
    </article>
  );
}
