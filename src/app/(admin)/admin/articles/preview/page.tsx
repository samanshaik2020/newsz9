import { ArticlePreviewClient } from "@/components/admin/ArticlePreviewClient";

export default function DraftArticlePreviewPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Article Preview</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This page renders the latest draft opened from the article editor.
        </p>
      </div>
      <ArticlePreviewClient />
    </div>
  );
}
