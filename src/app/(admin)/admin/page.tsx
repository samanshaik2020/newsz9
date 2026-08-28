import Link from "next/link";
import { CopyArticleLinkButton } from "@/components/admin/CopyArticleLinkButton";
import {
  getAdminArticleStats,
  getAdminArticles,
  getAdminBreakingNews,
  getCategories,
} from "@/lib/data";

export default async function AdminDashboardPage() {
  const [articles, categories, breakingNews] = await Promise.all([
    getAdminArticles(5),
    getCategories(),
    getAdminBreakingNews(),
  ]);
  const articleStats = await getAdminArticleStats(categories);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Editorial control center for newsz9 publishing.
          </p>
        </div>
        <Link
          className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          href="/admin/articles/new"
        >
          Add New Article
        </Link>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["All Articles", articleStats.total],
          ["Published", articleStats.published],
          ["In Review", articleStats.review],
          ["Drafts", articleStats.draft],
          ["Categories", categories.length],
          ["Active Breaking", breakingNews.length],
        ].map(([label, value]) => (
          <div className="rounded-md border border-zinc-200 bg-white p-5" key={label}>
            <p className="text-sm font-semibold text-zinc-500">{label}</p>
            <p className="mt-3 text-4xl font-black">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-md border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3">
          <div>
            <h2 className="text-lg font-black">Articles by Category</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Exact article totals across every publishing status.
            </p>
          </div>
          {articleStats.uncategorized > 0 ? (
            <p className="text-sm font-semibold text-zinc-600">
              Uncategorized: {articleStats.uncategorized}
            </p>
          ) : null}
        </div>
        {articleStats.byCategory.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {articleStats.byCategory.map(({ category, count }) => (
              <div
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3"
                key={category.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-zinc-900">{category.name}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {category.language === "te" ? "Telugu" : "English"}
                  </p>
                </div>
                <span className="grid h-10 min-w-10 place-items-center rounded-full bg-red-700 px-3 text-sm font-black text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">No categories found.</p>
        )}
      </section>
      <section className="rounded-md border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
          <h2 className="text-lg font-black">Recent Articles</h2>
          <Link className="text-sm font-bold text-red-700" href="/admin/articles">
            Manage all
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {articles.map((article) => (
            <div
              className="grid gap-3 rounded-md border border-zinc-200 p-3 hover:bg-zinc-50 md:grid-cols-[1fr_120px_120px_130px] md:items-center"
              key={article.id}
            >
              <Link
                className="font-bold hover:text-red-700"
                href={`/admin/articles/${article.id}`}
              >
                {article.title}
              </Link>
              <span className="text-sm text-zinc-500">
                {article.categories?.name ?? "No category"}
              </span>
              <span className="text-sm font-semibold capitalize text-zinc-700">
                {article.status}
              </span>
              <span className="flex md:justify-end">
                <CopyArticleLinkButton slug={article.slug} />
              </span>
            </div>
          ))}
          {!articles.length ? (
            <div className="rounded-md border border-dashed border-zinc-300 p-5 text-center">
              <p className="text-sm text-zinc-600">No articles have been created yet.</p>
              <Link
                className="mt-3 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                href="/admin/articles/new"
              >
                Add New Article
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
