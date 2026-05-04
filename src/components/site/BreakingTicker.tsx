import Link from "next/link";
import type { BreakingNewsItem } from "@/types";

export function BreakingTicker({ items }: { items: BreakingNewsItem[] }) {
  if (!items.length) return null;

  return (
    <section className="border-b border-red-200 bg-red-700 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2">
        <span className="ticker-label shrink-0 rounded bg-white px-2 py-1 text-xs font-black uppercase text-red-700">
          Breaking
        </span>
        <div className="flex min-w-0 gap-6 overflow-x-auto text-sm font-semibold">
          {items.map((item) =>
            item.url ? (
              <Link className="whitespace-nowrap hover:underline" href={item.url} key={item.id}>
                {item.headline}
              </Link>
            ) : (
              <span className="whitespace-nowrap" key={item.id}>
                {item.headline}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
