import Link from "next/link";
import type { BreakingNewsItem } from "@/types";

export function BreakingTicker({ items }: { items: BreakingNewsItem[] }) {
  if (!items.length) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex overflow-hidden bg-zinc-50 text-sm font-bold shadow-[inset_0_0_0_1px_rgb(244_244_245)]">
          <div className="flex shrink-0 items-center gap-2 bg-red-100 px-3 py-3 text-red-600">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_3px_rgb(254_202_202)]" />
            <span className="whitespace-nowrap">LIVE NOW</span>
          </div>
          <div className="flex min-w-0 items-center gap-10 overflow-x-auto px-4 py-3 text-zinc-950">
            {items.map((item) =>
              item.url ? (
                <Link
                  className="flex shrink-0 items-center gap-3 hover:text-red-600"
                  href={item.url}
                  key={item.id}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  <span>{item.headline}</span>
                </Link>
              ) : (
                <span className="flex shrink-0 items-center gap-3" key={item.id}>
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  <span>{item.headline}</span>
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
