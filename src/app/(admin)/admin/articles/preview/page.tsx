import { ArticlePreviewClient } from "@/components/admin/ArticlePreviewClient";

export default function DraftArticlePreviewPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">కథనం ముందస్తు వీక్షణ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          కథన సంపాదకంలో తెరిచిన తాజా ముసాయిదా ఇక్కడ కనిపిస్తుంది.
        </p>
      </div>
      <ArticlePreviewClient />
    </div>
  );
}
