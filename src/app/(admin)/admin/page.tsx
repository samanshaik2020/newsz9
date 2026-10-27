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
          <h1 className="text-3xl font-black">నిర్వాహక పటం</h1>
          <p className="mt-2 text-sm text-zinc-600">
            న్యూస్‌జెడ్‌9 కథనాల నిర్వహణ కేంద్రం.
          </p>
        </div>
        <Link
          className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          href="/admin/articles/new"
        >
          కొత్త కథనం జోడించండి
        </Link>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["మొత్తం కథనాలు", articleStats.total],
          ["ప్రచురితమైనవి", articleStats.published],
          ["సమీక్షలో", articleStats.review],
          ["ముసాయిదాలు", articleStats.draft],
          ["విభాగాలు", categories.length],
          ["చేతనమైన తాజా సమాచారం", breakingNews.length],
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
            <h2 className="text-lg font-black">విభాగాల వారీగా కథనాలు</h2>
            <p className="mt-1 text-sm text-zinc-500">
              అన్ని ప్రచురణ దశల్లో ఉన్న కథనాల సంఖ్య.
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
                    {category.language === "te" ? "తెలుగు" : "పాత ఆంగ్ల విభాగం"}
                  </p>
                </div>
                <span className="grid h-10 min-w-10 place-items-center rounded-full bg-red-700 px-3 text-sm font-black text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">విభాగాలు కనిపించలేదు.</p>
        )}
      </section>
      <section className="rounded-md border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-3">
          <h2 className="text-lg font-black">ఇటీవలి కథనాలు</h2>
          <Link className="text-sm font-bold text-red-700" href="/admin/articles">
            అన్నీ నిర్వహించండి
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
                {article.categories?.name ?? "విభాగం లేదు"}
              </span>
              <span className="text-sm font-semibold capitalize text-zinc-700">
                {{ draft: "ముసాయిదా", review: "సమీక్షలో", published: "ప్రచురితం", archived: "భద్రపరిచినది" }[article.status]}
              </span>
              <span className="flex md:justify-end">
                <CopyArticleLinkButton slug={article.slug} />
              </span>
            </div>
          ))}
          {!articles.length ? (
            <div className="rounded-md border border-dashed border-zinc-300 p-5 text-center">
              <p className="text-sm text-zinc-600">ఇంకా కథనాలు సృష్టించలేదు.</p>
              <Link
                className="mt-3 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                href="/admin/articles/new"
              >
                కొత్త కథనం జోడించండి
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
