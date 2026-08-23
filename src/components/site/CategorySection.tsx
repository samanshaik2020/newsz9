import Link from "next/link";
import { cn, containsTeluguText } from "@/lib/utils";
import type { ArticleListItem, Category } from "@/types";
import { ArticleCard } from "./ArticleCard";

export function CategorySection({
  category,
  articles,
}: {
  category: Category;
  articles: ArticleListItem[];
}) {
  const categoryArticles = articles
    .filter((article) => article.categories?.slug === category.slug)
    .slice(0, 4);
  const isTelugu = containsTeluguText(category.name);

  if (!categoryArticles.length) return null;

  return (
    <section>
      <div className="section-heading">
        <h2
          className={cn("section-heading__title", isTelugu && "telugu-copy")}
          lang={isTelugu ? "te" : undefined}
        >
          {category.name}
        </h2>
        <Link className="section-heading__link" href={`/${category.slug}`}>
          View More &gt;
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {categoryArticles.map((article) => (
          <ArticleCard article={article} key={article.id} showExcerpt={false} />
        ))}
      </div>
    </section>
  );
}
