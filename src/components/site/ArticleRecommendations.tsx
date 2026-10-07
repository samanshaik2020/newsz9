import { getArticlesByCategory, getPublishedArticles, getTrendingArticles } from "@/lib/data";
import type { Article } from "@/types";
import { RelatedArticles } from "./RelatedArticles";

export async function ArticleRecommendations({ article }: { article: Article }) {
  const [categoryArticles, trendingArticles, latestArticles] = await Promise.all([
    article.categories?.slug
      ? getArticlesByCategory(article.categories.slug, article.language)
      : Promise.resolve([]),
    getTrendingArticles(8, article.language),
    getPublishedArticles(8, 0, article.language),
  ]);
  const relatedArticles = categoryArticles.filter((item) => item.id !== article.id).slice(0, 4);
  const shownIds = new Set([article.id, ...relatedArticles.map((item) => item.id)]);
  const moreStories = [...trendingArticles, ...latestArticles]
    .filter((item) => {
      if (shownIds.has(item.id)) return false;
      shownIds.add(item.id);
      return true;
    })
    .slice(0, 4);

  return <RelatedArticles articles={relatedArticles} moreStories={moreStories} />;
}
