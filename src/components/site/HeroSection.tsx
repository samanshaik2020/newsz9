import Image from "next/image";
import Link from "next/link";
import { formatDate, getImageSrc } from "@/lib/utils";
import type { Article } from "@/types";

export function HeroSection({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);

  return (
    <section className="grid gap-6 border-b border-zinc-200 pb-8 lg:grid-cols-[1.45fr_1fr]">
      <Link
        className="relative min-h-[320px] overflow-hidden rounded-md bg-zinc-100"
        href={`/article/${article.slug}`}
      >
        {imageSrc ? (
          <Image
            alt={article.title}
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            src={imageSrc}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
          <span className="news-label rounded bg-red-700 px-2 py-1 text-xs font-black uppercase">
            {article.categories?.name ?? "Top Story"}
          </span>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
            {article.title}
          </h1>
        </div>
      </Link>
      <div className="flex flex-col justify-center gap-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          Lead Story
        </div>
        <p className="text-lg leading-8 text-zinc-700">{article.summary}</p>
        <div className="text-sm text-zinc-500">
          {article.authors?.name ?? "newsz9 Desk"} | {formatDate(article.published_at)}
        </div>
        <Link
          className="inline-flex w-fit rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          href={`/article/${article.slug}`}
        >
          Read full story
        </Link>
      </div>
    </section>
  );
}
