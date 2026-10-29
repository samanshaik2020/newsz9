"use client";

import type { ArticleFormInput } from "@/types";

export function ArticleDetails({ value, onChange }: { value: ArticleFormInput; onChange: (value: ArticleFormInput) => void }) {
  const inputClass = "min-h-11 rounded border border-zinc-300 p-3 font-normal";
  return <section className="grid gap-5 rounded-lg border border-zinc-200 bg-zinc-50 p-5">
    <h2 className="text-2xl font-bold">Article Details</h2>
    <label className="grid gap-2">Cover Image Description in Telugu<input className={inputClass} value={value.cover_alt ?? ""} onChange={(e) => onChange({ ...value, cover_alt: e.target.value })} /></label>
    <label className="grid gap-2">Image Source and Usage Rights<input className={inputClass} value={value.image_credit ?? ""} onChange={(e) => onChange({ ...value, image_credit: e.target.value })} placeholder="Original image or permission details" /></label>
    <label className="grid gap-2">Article Type<select className={inputClass} value={value.content_kind ?? "news"} onChange={(e) => onChange({ ...value, content_kind: e.target.value as ArticleFormInput["content_kind"] })}><option value="news">News</option><option value="analysis">Analysis</option><option value="opinion">Opinion</option><option value="sponsored">Sponsored Article</option></select></label>
    {value.content_kind === "sponsored" && <label className="grid gap-2">Sponsor Name in Telugu<input className={inputClass} value={value.sponsor_name ?? ""} onChange={(e) => onChange({ ...value, sponsor_name: e.target.value })} /></label>}
    <label className="flex gap-3"><input type="checkbox" checked={Boolean(value.ai_assisted)} onChange={(e) => onChange({ ...value, ai_assisted: e.target.checked })} />AI assistance was used in preparing this article</label>
    <label className="flex gap-3"><input type="checkbox" checked={Boolean(value.editorial_reviewed)} onChange={(e) => onChange({ ...value, editorial_reviewed: e.target.checked })} />A human editor has verified the facts, image rights, and original writing</label>
  </section>;
}
