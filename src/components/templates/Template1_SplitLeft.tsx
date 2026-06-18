import Image from "next/image";
import { ArticleGallery } from "@/components/templates/ArticleGallery";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template1({ article }: { article: Article }) {
  const coverImage = getImageSrc(article.cover_image);
  const imageSrc = coverImage ?? "/newsz9-logo.svg";
  const categoryName = article.categories?.name ?? "News";
  const authorName = article.authors?.name ?? "newsz9 Desk";

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      {/* ── Split header: Image LEFT | Details RIGHT ── */}
      <div className="grid items-center gap-8 md:grid-cols-2">
        {/* Left — Cover image */}
        <figure className="relative overflow-hidden rounded-xl bg-zinc-100 shadow-lg">
          <Image
            alt={article.title}
            className={
              coverImage
                ? "aspect-[4/3] w-full object-cover"
                : "aspect-[4/3] w-full object-contain p-8"
            }
            height={570}
            priority
            src={imageSrc}
            width={760}
          />
          <span className="absolute left-3 top-3 rounded bg-red-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-md">
            {categoryName}
          </span>
        </figure>

        {/* Right — Title, author, date, summary */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-black uppercase tracking-widest text-red-700">
            {categoryName}
          </span>
          <h1 className="mt-2 text-2xl font-black leading-tight text-zinc-950 md:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
            <span className="font-semibold text-zinc-700">{authorName}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-400" />
            <time>{formatDate(article.published_at)}</time>
          </div>
          {article.summary ? (
            <p className="mt-5 border-l-4 border-red-700 pl-4 text-base leading-7 text-zinc-600 md:text-lg md:leading-8">
              {article.summary}
            </p>
          ) : null}
        </div>
      </div>

      {/* ── Content section ── */}
      <div className="mx-auto mt-10 max-w-3xl">
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
