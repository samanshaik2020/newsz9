import { categoryDisplayName } from "@/lib/language";
import Link from "next/link";
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

  if (!categoryArticles.length) return null;

  return (
    <section>
      <div className="section-heading">
        <h2
          className="section-heading__title"
          lang="en"
        >
          {categoryDisplayName(category)}
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
