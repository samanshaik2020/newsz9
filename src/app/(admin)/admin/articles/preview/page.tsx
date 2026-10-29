import { ArticlePreviewClient } from "@/components/admin/ArticlePreviewClient";

export default function DraftArticlePreviewPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Article Preview</h1>
        <p className="mt-2 text-sm text-zinc-600">
          The latest draft opened in the article editor appears here.
        </p>
      </div>
      <ArticlePreviewClient />
    </div>
  );
}
