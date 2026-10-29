import Link from "next/link";
import { maybeCreateServiceClient } from "@/lib/supabase";
export default async function Page() {
  const s = maybeCreateServiceClient();
  const result = s ? await s.from("editorial_review_queue").select("*").eq("status", "published").limit(1000) : null;
  const rows = result?.data ?? [];
  const flags = { non_telugu: "Telugu Language Review", future_date: "Future Date", needs_review: "Human Review", needs_author: "Author Profile", needs_image_description: "Image description", repeated_title: "Duplicate Title" };
  const flagged = rows.filter((row) => Object.keys(flags).some((key) => row[key]));
  return <div className="grid gap-6"><h1 className="text-3xl font-bold">Content Quality Audit</h1>
    <p>Review existing articles individually and complete their sources, authors, image rights, and correction details. This check does not detect copies on other websites; an editor must verify originality.</p>
    {!result || result.error ? <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-5">The database audit is unavailable. Apply the editorial database migration and check the connection.</p> : <>
      <p>{rows.length} articles checked. {flagged.length} articles need further review.{rows.length === 1000 ? " See the database review queue for the remaining articles." : ""}</p>
      {flagged.map((row) => <article className="rounded border bg-white p-5" key={row.id}><h2 className="text-xl font-bold">{row.title}</h2><ul className="my-3 flex flex-wrap gap-3">{Object.entries(flags).filter(([key]) => row[key]).map(([key, label]) => <li className="rounded bg-amber-50 px-3 py-1 text-amber-900" key={key}>{label}</li>)}</ul><Link className="text-red-700 underline" href={`/admin/articles/${row.id}`}>Review and Edit</Link></article>)}
    </>}
    <Link href="/editorial-policy" className="text-red-700 underline">Read the Editorial Policy</Link>
  </div>;
}
