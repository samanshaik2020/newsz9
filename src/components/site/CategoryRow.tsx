import type { Article, Category } from "@/types";
import { cn, containsTeluguText } from "@/lib/utils";
import { ArticleCard } from "./ArticleCard";

export function CategoryRow({
  category,
  articles,
}: {
  category: Category;
  articles: Article[];
}) {
  const categoryArticles = articles
    .filter((article) => article.categories?.slug === category.slug)
    .slice(0, 3);

  if (!categoryArticles.length) return null;

  return (
    <section className="grid gap-1 border-t-2 border-zinc-950 pt-1">
      <div className="flex items-end justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <h2
          className={cn(
            "text-xl font-black",
            containsTeluguText(category.name) && "telugu-copy",
          )}
          lang={containsTeluguText(category.name) ? "te" : undefined}
        >
          {category.name}
        </h2>
      </div>
      <div className="grid gap-x-6 md:grid-cols-3">
        {categoryArticles.map((article) => (
          <ArticleCard article={article} key={article.id} />
        ))}
      </div>
    </section>
  );
}
