import { notFound } from "next/navigation";
import Link from "next/link";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { getAdminArticleById } from "@/lib/data";

export default async function SavedArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getAdminArticleById(id);

  if (!article) notFound();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Article Preview</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Protected preview for saved article: {article.title}
          </p>
        </div>
        <Link
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
          href={`/admin/articles/${article.id}`}
        >
          Edit Article
        </Link>
      </div>
      <div className="rounded-md border border-zinc-200 bg-white shadow-sm">
        <TemplateRenderer article={article} />
      </div>
    </div>
  );
}
