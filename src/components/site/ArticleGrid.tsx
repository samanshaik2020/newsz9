import type { ArticleListItem } from "@/types";
import { ArticleCard } from "./ArticleCard";

export function ArticleGrid({ articles }: { articles: ArticleListItem[] }) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard article={article} key={article.id} />
      ))}
    </section>
  );
}
