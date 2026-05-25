import Image from "next/image";
import { ArticleGallery } from "@/components/templates/ArticleGallery";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template4({ article }: { article: Article }) {
  const coverImage = getImageSrc(article.cover_image);
  const imageSrc = coverImage ?? "/newsz9-logo.svg";

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <div className="relative mb-6 min-h-[320px] overflow-hidden rounded-md bg-zinc-100 shadow-sm md:aspect-[21/9]">
        <Image
          alt={article.title}
          className={coverImage ? "object-cover" : "object-contain p-8"}
          fill
          priority
          src={imageSrc}
        />
        <div className={coverImage ? "absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" : "absolute inset-0 bg-gradient-to-t from-white via-white/75 to-transparent"} />
        <div className={coverImage ? "absolute bottom-0 left-0 right-0 p-6 text-white md:p-8" : "absolute bottom-0 left-0 right-0 p-6 text-zinc-950 md:p-8"}>
          <span className="news-label mb-3 inline-block rounded bg-red-700 px-3 py-1 text-xs font-black uppercase text-white">
            {article.categories?.name ?? "Breaking"}
          </span>
          <h1 className="max-w-4xl text-2xl font-black leading-tight md:text-5xl">
            {article.title}
          </h1>
          <p className={coverImage ? "mt-3 text-sm text-zinc-200" : "mt-3 text-sm text-zinc-600"}>
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
        <ArticleGallery article={article} className="mb-8" />
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: processArticleHtml(article.content) }}
        />
      </div>
    </article>
  );
}
