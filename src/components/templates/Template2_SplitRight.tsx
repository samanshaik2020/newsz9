import Image from "next/image";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template2({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="news-label text-sm font-black uppercase text-red-700">
            {article.categories?.name ?? "News"}
          </span>
          <h1 className="text-3xl font-black leading-tight text-zinc-950 md:text-5xl">
            {article.title}
          </h1>
          <p className="text-sm text-zinc-500">
            {article.authors?.name ?? "newsz9 Desk"} | {formatDate(article.published_at)}
          </p>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: processArticleHtml(article.content) }}
          />
        </div>
        <div className="md:sticky md:top-32 md:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-100 shadow-sm">
            {imageSrc ? (
              <Image alt={article.title} className="object-cover" fill priority src={imageSrc} />
            ) : null}
          </div>
          <p className="mt-2 text-center text-xs text-zinc-500">Photo: {article.title}</p>
        </div>
      </div>
    </article>
  );
}
