import Image from "next/image";
import { ArticleGallery } from "@/components/templates/ArticleGallery";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template4({ article }: { article: Article }) {
  const coverImage = getImageSrc(article.cover_image);
  const imageSrc = coverImage ?? "/newsz9-logo.svg";
  const categoryName = article.categories?.name ?? "Breaking";
  const authorName = article.authors?.name ?? "newsz9 Desk";
  const hasCover = Boolean(coverImage);

  return (
    <article>
      {/* ── Cinematic hero block ── */}
      <div className="relative flex min-h-[50vh] w-full items-end overflow-hidden bg-zinc-900 md:min-h-[65vh]">
        {/* Background image */}
        <Image
          alt={article.title}
          className={hasCover ? "object-cover" : "object-contain p-12 opacity-30"}
          fill
          priority
          sizes="100vw"
          src={imageSrc}
        />

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent" />

        {/* Overlaid text content */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 md:pb-14">
          <span className="inline-block rounded bg-red-700 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white shadow-lg">
            {categoryName}
          </span>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-[1.08] text-white md:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          {article.summary ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
              {article.summary}
            </p>
          ) : null}
          <div className="mt-5 flex items-center gap-3 text-sm">
            <span className="font-semibold text-white">{authorName}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-500" />
            <time className="text-zinc-400">
              {formatDate(article.published_at)}
            </time>
          </div>
        </div>
      </div>

      {/* ── Content section ── */}
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Gallery */}
        <ArticleGallery article={article} className="mb-8" />

        {/* Article body */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{
            __html: processArticleHtml(article.content),
          }}
        />
      </div>
    </article>
  );
}
