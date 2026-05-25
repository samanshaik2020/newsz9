import Image from "next/image";
import { ArticleGallery } from "@/components/templates/ArticleGallery";
import { formatDate, getImageSrc, processArticleHtml } from "@/lib/utils";
import type { Article } from "@/types";

export default function Template2({ article }: { article: Article }) {
  const coverImage = getImageSrc(article.cover_image);
  const imageSrc = coverImage ?? "/newsz9-logo.svg";

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-4">
        <span className="news-label text-sm font-black uppercase text-red-700">
          {article.categories?.name ?? "News"}
        </span>
        <h1 className="text-2xl font-black leading-tight text-zinc-950 md:text-4xl">
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
        <div className="article-body">
          <figure className="article-cover-float article-cover-float--right">
            <div className="overflow-hidden rounded-md bg-zinc-100 shadow-sm">
              <Image
                alt={article.title}
                className={
                  coverImage
                    ? "article-cover-image"
                    : "article-cover-image article-cover-image--fallback"
                }
                height={570}
                priority
                src={imageSrc}
                width={760}
              />
            </div>
            <figcaption>{coverImage ? `Photo: ${article.title}` : "NEWSZ9"}</figcaption>
          </figure>
          <div dangerouslySetInnerHTML={{ __html: processArticleHtml(article.content) }} />
        </div>
        <ArticleGallery article={article} className="clear-both" />
      </div>
    </article>
  );
}
