import Image from "next/image";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template1({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-100 shadow-sm">
          {imageSrc ? (
            <Image alt={article.title} className="object-cover" fill priority src={imageSrc} />
          ) : null}
          <span className="news-label absolute left-3 top-3 rounded bg-red-700 px-3 py-1 text-xs font-black uppercase text-white">
            {article.categories?.name ?? "News"}
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-black leading-tight text-zinc-950 md:text-5xl">
            {article.title}
          </h1>
          <p className="text-sm text-zinc-500">
            {article.authors?.name ?? "newsz9 Desk"} | {formatDate(article.published_at)}
          </p>
          {article.summary ? (
            <p className="border-l-4 border-red-700 pl-4 text-lg font-semibold leading-8 text-zinc-700">
              {article.summary}
            </p>
          ) : null}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: processArticleHtml(article.content) }}
          />
        </div>
      </div>
    </article>
  );
}
