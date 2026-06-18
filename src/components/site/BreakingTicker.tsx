import Link from "next/link";
import { cn, containsTeluguText } from "@/lib/utils";
import type { BreakingNewsItem } from "@/types";

function TickerItem({ item }: { item: BreakingNewsItem }) {
  const isTelugu = containsTeluguText(item.headline);
  const className = cn(
    "mx-5 inline-flex items-center gap-3 whitespace-nowrap hover:underline",
    isTelugu && "telugu-copy",
  );

  if (!item.url) {
    return (
      <span className={className} lang={isTelugu ? "te" : undefined}>
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        {item.headline}
      </span>
    );
  }

  return (
    <Link className={className} href={item.url} lang={isTelugu ? "te" : undefined}>
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {item.headline}
    </Link>
  );
}

export function BreakingTicker({ items }: { items: BreakingNewsItem[] }) {
  if (!items.length) return null;

  const loopItems = [...items, ...items];

  return (
    <section className="bg-[var(--color-news-red)] text-white">
      <div className="mx-auto flex max-w-7xl items-center px-4">
        <div className="ticker-label flex min-h-11 shrink-0 items-center gap-2 bg-red-800 px-3 text-xs font-black uppercase">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          Breaking News
        </div>
        <div className="breaking-marquee min-w-0 flex-1 text-sm font-bold">
          <div className="breaking-track py-3">
            {loopItems.map((item, index) => (
              <TickerItem item={item} key={`${item.id}-${index}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
