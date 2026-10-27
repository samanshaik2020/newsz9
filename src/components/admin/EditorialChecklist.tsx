"use client";
import { publicationIssues } from "@/lib/editorial";
import type { ArticleFormInput, Author, Category } from "@/types";
export function EditorialChecklist({ value, onChange, authors, authorId, categories }: { value: ArticleFormInput; onChange: (value: ArticleFormInput) => void; authors: Author[]; authorId: string; categories: Category[] }) {
  const issues = publicationIssues(value, authors.find((a) => a.id === authorId), categories.find((c) => c.id === value.category_id), authors.find((a) => a.id === value.reviewer_id));
  const inputClass = "min-h-11 rounded border border-zinc-300 p-3 font-normal";
  return <section className="grid gap-5 rounded-lg border border-red-200 bg-red-50/40 p-5">
    <h2 className="text-2xl font-bold">ప్రచురణకు ముందు తనిఖీ</h2>
    <p>సొంత తెలుగు రచన, తనిఖీ చేసిన ఆధారాలు, నిజమైన రచయిత తప్పనిసరి. కనీసం 150 పదాలు, రెండు ఉపశీర్షికలు మా సంపాదకీయ ప్రమాణాలు. పదాల సంఖ్య గూగుల్ ఆమోదానికి హామీ కాదు. స్క్రిప్టులు, ఫారాలు, పొందుపరిచిన విడ్జెట్లు కథనంలో అంగీకరించబడవు.</p>
    <label className="grid gap-2">ప్రధాన చిత్రానికి తెలుగు వివరణ<input className={inputClass} value={value.cover_alt ?? ""} onChange={(e) => onChange({ ...value, cover_alt: e.target.value })} /></label>
    <label className="grid gap-2">చిత్ర మూలం, వినియోగ హక్కు<input className={inputClass} value={value.image_credit ?? ""} onChange={(e) => onChange({ ...value, image_credit: e.target.value })} placeholder="సొంత చిత్రం లేదా అనుమతి వివరాలు" /></label>
    <label className="grid gap-2">కథనం రకం<select className={inputClass} value={value.content_kind ?? "news"} onChange={(e) => onChange({ ...value, content_kind: e.target.value as ArticleFormInput["content_kind"] })}><option value="news">వార్త</option><option value="analysis">విశ్లేషణ</option><option value="opinion">అభిప్రాయం</option><option value="sponsored">ప్రాయోజిత కథనం</option></select></label>
    {value.content_kind === "sponsored" && <label className="grid gap-2">ప్రాయోజకుడి పేరు తెలుగులో<input className={inputClass} value={value.sponsor_name ?? ""} onChange={(e) => onChange({ ...value, sponsor_name: e.target.value })} /></label>}
    <fieldset className="grid gap-3"><legend className="mb-2 font-bold">తనిఖీ చేసిన మూలాలు</legend>
      {(value.sources ?? []).map((source, index) => <div className="grid gap-2 rounded border bg-white p-3" key={index}>
        <label className="grid gap-1">మూలం పేరు తెలుగులో<input className={inputClass} value={source.title} onChange={(e) => onChange({ ...value, sources: value.sources!.map((s, i) => i === index ? { ...s, title: e.target.value } : s) })} /></label>
        <label className="grid gap-1">ఆధారం లింకు<input type="url" className={inputClass} value={source.url} onChange={(e) => onChange({ ...value, sources: value.sources!.map((s, i) => i === index ? { ...s, url: e.target.value } : s) })} /></label>
        <button className="text-left text-red-700 underline" type="button" onClick={() => onChange({ ...value, sources: value.sources!.filter((_, i) => i !== index) })}>ఈ మూలాన్ని తొలగించండి</button>
      </div>)}
      <button className="justify-self-start rounded border bg-white px-4 py-2" type="button" onClick={() => onChange({ ...value, sources: [...(value.sources ?? []), { title: "", url: "" }] })}>మరో మూలం జోడించండి</button>
    </fieldset>
    <label className="grid gap-2">మీ సొంత నివేదిక లేదా అదనపు పరిశీలన<textarea className={inputClass} value={value.original_reporting ?? ""} onChange={(e) => onChange({ ...value, original_reporting: e.target.value })} /></label>
    <label className="grid gap-2">వైద్య సమీక్షకుడు — ఆరోగ్య కథనాలకు తప్పనిసరి<select className={inputClass} value={value.reviewer_id ?? ""} onChange={(e) => onChange({ ...value, reviewer_id: e.target.value || null })}><option value="">ఎంచుకోండి</option>{authors.filter((a) => a.role !== "bot" && a.credentials).map((a) => <option key={a.id} value={a.id}>{a.name} — {a.credentials}</option>)}</select></label>
    <p className="text-sm">వైద్య సమీక్షను నిజంగా చేసిన వ్యక్తి అర్హతలను రచయితల నిర్వహణలో నమోదు చేయండి. సమీక్ష లేకుండా సమీక్షించినట్లు చూపవద్దు.</p>
    <label className="flex gap-3"><input type="checkbox" checked={Boolean(value.ai_assisted)} onChange={(e) => onChange({ ...value, ai_assisted: e.target.checked })} />రచనలో కృత్రిమ మేధ సహాయం ఉపయోగించాం</label>
    <label className="grid gap-2">సవరణ లేదా నవీకరణ గమనిక<textarea className={inputClass} value={value.correction_note ?? ""} onChange={(e) => onChange({ ...value, correction_note: e.target.value })} /></label>
    <label className="flex gap-3"><input type="checkbox" checked={Boolean(value.editorial_reviewed)} onChange={(e) => onChange({ ...value, editorial_reviewed: e.target.checked })} />వాస్తవాలు, మూలాలు, చిత్ర హక్కులు, సొంత రచనను మానవ సంపాదకుడు తనిఖీ చేశారు</label>
    <div aria-live="polite" className="rounded border bg-white p-4"><h3 className="font-bold">{issues.length ? `ఇంకా పూర్తి చేయాల్సినవి: ${issues.length}` : "ప్రాథమిక ప్రచురణ తనిఖీలు పూర్తయ్యాయి"}</h3>
      {issues.length > 0 && <ul className="mt-3 list-disc space-y-2 pl-5">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
      <p className="mt-3 text-sm text-zinc-600">భద్రపరిచేటప్పుడు సర్వర్‌లో పునరావృత కథనాల తనిఖీ కూడా జరుగుతుంది. ఇవి మానవ సమీక్షకు ప్రత్యామ్నాయం కావు.</p>
    </div>
  </section>;
}
