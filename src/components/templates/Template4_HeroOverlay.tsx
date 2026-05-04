import Image from "next/image";
import { formatDate, getImageSrc } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template4({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <div className="relative mb-10 min-h-[360px] overflow-hidden rounded-md bg-zinc-100 shadow-sm md:aspect-[21/9]">
        {imageSrc ? (
          <Image alt={article.title} className="object-cover" fill priority src={imageSrc} />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
          <span className="news-label mb-3 inline-block rounded bg-red-700 px-3 py-1 text-xs font-black uppercase">
            {article.categories?.name ?? "Breaking"}
          </span>
          <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-6xl">
            {article.title}
          </h1>
          <p className="mt-3 text-sm text-zinc-200">
            {article.authors?.name ?? "newsz9 Desk"} | {formatDate(article.published_at)}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        {article.summary ? (
          <p className="mb-8 border-l-4 border-red-700 pl-5 text-xl font-semibold leading-8 text-zinc-700">
            {article.summary}
          </p>
        ) : null}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </article>
  );
}
