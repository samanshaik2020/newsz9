import type {
  AdminArticleStats,
  Article,
  Category,
} from "@/types";

type CountableArticle = Pick<Article, "categories" | "category_id" | "status">;

function getArticleCategoryId(article: CountableArticle) {
  return article.category_id ?? article.categories?.id ?? null;
}

export function buildAdminArticleStats(
  articles: CountableArticle[],
  categories: Category[],
): AdminArticleStats {
  const categoryCounts = new Map<string, number>();

  for (const article of articles) {
    const categoryId = getArticleCategoryId(article);

    if (categoryId) {
      categoryCounts.set(
        categoryId,
        (categoryCounts.get(categoryId) ?? 0) + 1,
      );
    }
  }

  return {
    total: articles.length,
    published: articles.filter((article) => article.status === "published").length,
    review: articles.filter((article) => article.status === "review").length,
    draft: articles.filter((article) => article.status === "draft").length,
    archived: articles.filter((article) => article.status === "archived").length,
    uncategorized: articles.filter((article) => !getArticleCategoryId(article)).length,
    byCategory: categories
      .map((category) => ({
        category,
        count: categoryCounts.get(category.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.count - a.count || a.category.name.localeCompare(b.category.name),
      ),
  };
}
