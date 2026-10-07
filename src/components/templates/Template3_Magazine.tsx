import Image from "next/image";
import { ArticleAuthorFooter } from "@/components/site/ArticleAuthorFooter";
import { VerifiedAuthor } from "@/components/site/VerifiedAuthor";
import { ArticleGallery } from "@/components/templates/ArticleGallery";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import { NEWSZ9_WORDMARK } from "@/lib/branding";
import type { Article } from "@/types";

export default function Template3({ article }: { article: Article }) {
  const coverImage = getImageSrc(article.cover_image);
  const imageSrc = coverImage ?? NEWSZ9_WORDMARK.src;
  const categoryName = article.categories?.name ?? "News";
  const authorName = article.authors?.name ?? "newsz9 Desk";

  return (
    <article>
      {/* ── Editorial header — centered, typographically rich ── */}
      <header className="mx-auto max-w-4xl px-4 pt-8 text-center">
        {/* Category */}
        <span className="inline-block rounded bg-red-700 px-4 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white">
          {categoryName}
        </span>

        {/* Headline */}
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-[1.1] tracking-tight text-zinc-950 md:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        {/* Summary / subtitle */}
        {article.summary ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg font-light leading-8 text-zinc-500 md:text-xl md:leading-9">
            {article.summary}
          </p>
        ) : null}

        {/* Author & date */}
        <div className="mt-6 flex items-center justify-center gap-3 border-b border-zinc-200 pb-6 text-sm text-zinc-500">
          <VerifiedAuthor name={authorName} />
          <span className="h-1 w-1 rounded-full bg-zinc-400" />
          <time>{formatDate(article.published_at)}</time>
        </div>
      </header>

      {/* ── Full-width cover image ── */}
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <figure className="relative overflow-hidden rounded-xl bg-zinc-100 shadow-xl">
          <Image
            alt={article.title}
            className={
              coverImage
                ? "aspect-[16/9] w-full object-cover md:aspect-[21/9]"
                : "aspect-[16/9] w-full object-contain p-10 md:aspect-[21/9]"
            }
            height={450}
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            src={imageSrc}
            width={1152}
          />
        </figure>
      </div>

      {/* ── Content section with drop-cap ── */}
      <div className="mx-auto mt-10 max-w-3xl px-4 pb-8">
        {/* Gallery */}
        <ArticleGallery article={article} className="mb-8" />

        {/* Article body — the magazine-drop-cap class styles the first letter */}
        <div
          className="article-body magazine-drop-cap"
          dangerouslySetInnerHTML={{
            __html: processArticleHtml(article.content),
          }}
        />
        <ArticleAuthorFooter article={article} />
      </div>
    </article>
  );
}
