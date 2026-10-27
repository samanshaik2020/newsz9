import Link from "next/link";
import { maybeCreateServiceClient } from "@/lib/supabase";
export default async function Page() {
  const s = maybeCreateServiceClient();
  const result = s ? await s.from("editorial_review_queue").select("*").eq("status", "published").limit(1000) : null;
  const rows = result?.data ?? [];
  const flags = { non_telugu: "తెలుగు సమీక్ష", future_date: "భవిష్యత్ తేదీ", needs_review: "మానవ సమీక్ష", needs_author: "రచయిత పరిచయం", needs_sources: "మూలాలు", needs_image_description: "చిత్ర వివరణ", repeated_title: "పునరావృత శీర్షిక" };
  const flagged = rows.filter((row) => Object.keys(flags).some((key) => row[key]));
  return <div className="grid gap-6"><h1 className="text-3xl font-bold">కథనాల నాణ్యతా పరిశీలన</h1>
    <p>పాత కథనాలను ఒక్కొక్కటిగా పరిశీలించి ఆధారాలు, రచయిత, చిత్ర హక్కులు, సవరణలను పూర్తి చేయండి. ఈ తనిఖీ ఇతర వెబ్‌సైట్లలోని కాపీలను గుర్తించే సేవ కాదు; సొంత రచనను సంపాదకుడు నిర్ధారించాలి.</p>
    {!result || result.error ? <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-5">డేటాబేస్ పరిశీలన అందుబాటులో లేదు. ముందుగా సంపాదకీయ డేటాబేస్ నవీకరణ అమలు చేసి అనుసంధానాన్ని తనిఖీ చేయండి.</p> : <>
      <p>{rows.length} కథనాలు తనిఖీ అయ్యాయి. {flagged.length} కథనాలకు అదనపు పరిశీలన అవసరం.{rows.length === 1000 ? " మిగతా కథనాల కోసం డేటాబేస్ సమీక్ష జాబితాను చూడండి." : ""}</p>
      {flagged.map((row) => <article className="rounded border bg-white p-5" key={row.id}><h2 className="text-xl font-bold">{row.title}</h2><ul className="my-3 flex flex-wrap gap-3">{Object.entries(flags).filter(([key]) => row[key]).map(([key, label]) => <li className="rounded bg-amber-50 px-3 py-1 text-amber-900" key={key}>{label}</li>)}</ul><Link className="text-red-700 underline" href={`/admin/articles/${row.id}`}>పరిశీలించి సవరించండి</Link></article>)}
    </>}
    <Link href="/editorial-policy" className="text-red-700 underline">సంపాదకీయ విధానం చదవండి</Link>
  </div>;
}
