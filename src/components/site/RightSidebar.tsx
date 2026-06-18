import { Gamepad2, Trophy } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn, containsTeluguText } from "@/lib/utils";
import type { Article } from "@/types";
import { AdBanner } from "./AdBanner";

function SidebarPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border border-zinc-200 bg-white">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-black uppercase text-zinc-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function RightSidebar({ articles }: { articles: Article[] }) {
  return (
    <aside className="sticky-sidebar hidden content-start gap-5 lg:grid">
      <SidebarPanel title="Trending Topics">
        <div className="grid">
          {articles.slice(0, 10).map((article, index) => {
            const isTelugu =
              article.language === "te" ||
              containsTeluguText(article.title) ||
              containsTeluguText(article.summary);

            return (
              <Link
                className={cn(
                  "grid grid-cols-[2.5rem_1fr] gap-3 border-b border-zinc-200 px-4 py-3 text-sm font-bold leading-6 last:border-b-0 hover:text-[var(--color-news-red)]",
                  isTelugu && "telugu-copy",
                )}
                href={`/article/${article.slug}`}
                key={article.id}
                lang={isTelugu ? "te" : undefined}
              >
                <span className="font-black text-[var(--color-news-red)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-2">{article.title}</span>
              </Link>
            );
          })}
        </div>
      </SidebarPanel>

      <AdBanner size="mobile" className="max-w-none" />

      <SidebarPanel title="Sports Scores">
        <div className="grid min-h-32 place-items-center p-5 text-center text-sm font-semibold text-zinc-500">
          <div>
            <Trophy className="mx-auto mb-2 h-7 w-7 text-[var(--color-news-red)]" aria-hidden="true" />
            Live score widget slot
          </div>
        </div>
      </SidebarPanel>

      <SidebarPanel title="Games">
        <div className="grid min-h-32 place-items-center p-5 text-center text-sm font-semibold text-zinc-500">
          <div>
            <Gamepad2 className="mx-auto mb-2 h-7 w-7 text-[var(--color-news-red)]" aria-hidden="true" />
            Games module slot
          </div>
        </div>
      </SidebarPanel>
    </aside>
  );
}
