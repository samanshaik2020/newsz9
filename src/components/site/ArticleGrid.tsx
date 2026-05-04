import type { Article } from "@/types";
import { ArticleCard } from "./ArticleCard";

export function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard article={article} key={article.id} />
      ))}
    </section>
  );
}
