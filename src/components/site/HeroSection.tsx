import Image from "next/image";
import Link from "next/link";
import { formatDate, getImageSrc } from "@/lib/utils";
import type { Article } from "@/types";

export function HeroSection({ article }: { article: Article }) {
  const imageSrc = getImageSrc(article.cover_image);
  const articleHref = `/article/${article.slug}`;

  return (
    <section className="border-b border-zinc-200 pb-7">
      <div className="mb-5 flex overflow-hidden bg-zinc-50 text-sm font-bold shadow-[inset_0_0_0_1px_rgb(244_244_245)]">
        <span className="shrink-0 bg-red-100 px-3 py-3 text-red-600">
          TOP STORY
        </span>
        <Link
          className="min-w-0 px-4 py-3 text-zinc-950 hover:text-red-600"
          href={articleHref}
        >
          <span className="line-clamp-1">{article.title}</span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col justify-center">
          <div className="mb-3 text-sm font-semibold text-red-600">
            {article.categories?.name ?? "News"}
          </div>
          <h1 className="max-w-4xl text-[2rem] font-black leading-tight text-zinc-950 sm:text-[2.65rem]">
            <Link className="hover:text-red-600" href={articleHref}>
              {article.title}
            </Link>
          </h1>
          {article.summary ? (
            <p className="mt-2 max-w-4xl text-[17px] leading-7 text-zinc-700">
              {article.summary}
            </p>
          ) : null}
          <div className="mt-3 text-sm font-medium text-zinc-500">
            {article.authors?.name ?? "newsz9 Desk"} |{" "}
            {formatDate(article.published_at)}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[article.categories?.name ?? "Latest", "India", "Business", "Sports"].map(
              (label, index) => (
                <Link
                  className={
                    index === 0
                      ? "rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-950 hover:text-zinc-950"
                  }
                  href={index === 0 && article.categories ? `/${article.categories.slug}` : `/search?q=${encodeURIComponent(label)}`}
                  key={label}
                >
                  {label}
                </Link>
              ),
            )}
          </div>
        </div>

        <Link
          className="relative block aspect-[16/10] overflow-hidden bg-zinc-100 lg:aspect-[4/3]"
          href={articleHref}
        >
          {imageSrc ? (
            <Image
              alt={article.title}
              className="object-cover transition duration-300 hover:scale-[1.03]"
              fill
              priority
              sizes="(min-width: 1024px) 380px, 100vw"
              src={imageSrc}
            />
          ) : (
            <span className="grid h-full place-items-center text-sm font-semibold uppercase text-zinc-500">
              Newsz9
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
