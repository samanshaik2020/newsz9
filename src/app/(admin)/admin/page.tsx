import Link from "next/link";
import {
  getAdminArticles,
  getAdminBreakingNews,
  getCategories,
} from "@/lib/data";

export default async function AdminDashboardPage() {
  const [articles, categories, breakingNews] = await Promise.all([
    getAdminArticles(100),
    getCategories(),
    getAdminBreakingNews(),
  ]);
  const publishedCount = articles.filter(
    (article) => article.status === "published",
  ).length;
  const reviewCount = articles.filter((article) => article.status === "review").length;

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
          New Article
        </Link>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["All Articles", articles.length],
          ["Published", publishedCount],
          ["In Review", reviewCount],
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
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
          <h2 className="text-lg font-black">Recent Articles</h2>
          <Link className="text-sm font-bold text-red-700" href="/admin/articles">
            Manage all
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {articles.slice(0, 5).map((article) => (
            <Link
              className="grid gap-2 rounded-md border border-zinc-200 p-3 hover:bg-zinc-50 md:grid-cols-[1fr_120px_120px]"
              href={`/admin/articles/${article.id}`}
              key={article.id}
            >
              <span className="font-bold">{article.title}</span>
              <span className="text-sm text-zinc-500">
                {article.categories?.name ?? "No category"}
              </span>
              <span className="text-sm font-semibold capitalize text-zinc-700">
                {article.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-md border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black">Build Notes</h2>
        <div className="mt-4 grid gap-2 text-sm leading-6 text-zinc-600">
          <p>Run the SQL in supabase/newsz9_schema.sql before connecting live data.</p>
          <p>Add ADMIN_PASSWORD before deploying the admin panel publicly.</p>
          <p>Auto-imported scraper stories should enter review status first.</p>
        </div>
      </section>
    </div>
  );
}
