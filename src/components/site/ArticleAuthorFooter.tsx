import { authorDisplayName } from "@/lib/authors";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";
import { VerifiedAuthor } from "./VerifiedAuthor";
import Link from "next/link";
import { safeSourceUrl } from "@/lib/editorial";

export function ArticleAuthorFooter({ article }: { article: Article }) {
  return (
    <footer lang="en" className="mt-10 grid gap-5 border-t border-zinc-200 pt-5 text-base text-zinc-700">
      <div><VerifiedAuthor authorId={article.authors?.role !== "bot" ? article.author_id : null} name={article.authors?.name ?? "Editorial Team"} />
      {article.authors?.bio && <p className="mt-2">{article.authors.bio}</p>}</div>
      <div className="grid gap-2 text-sm"><p>Published: <time dateTime={article.published_at ?? article.created_at}>{formatDate(article.published_at ?? article.created_at)}</time></p>
      {article.updated_at && Date.parse(article.updated_at) > Date.parse(article.published_at ?? article.created_at) && <p>Updated: <time dateTime={article.updated_at}>{formatDate(article.updated_at)}</time></p>}</div>
      <p className="text-sm text-zinc-600">Image source: {article.image_credit || "Usage rights details are unavailable."}</p>
      {article.sources?.length ? <section><h2 className="text-xl font-bold">Sources and Further Reading</h2><ul className="mt-3 list-disc space-y-2 pl-5">{article.sources.filter((s) => safeSourceUrl(s.url)).map((source) => <li key={source.url}><a className="text-red-700 underline" href={source.url} rel={article.content_kind === "sponsored" ? "sponsored noopener noreferrer" : "noopener noreferrer"} target="_blank">{source.title}</a></li>)}</ul></section> : article.source_url && safeSourceUrl(article.source_url) ? <a className="text-red-700 underline" href={article.source_url} rel="noopener noreferrer" target="_blank">Original Source</a> : null}
      {article.ai_assisted && <p className="rounded bg-zinc-50 p-4">AI assistance was used to prepare this article. The editorial team is responsible for its publication.</p>}
      {/health|ఆరోగ్య|వైద్య/i.test(`${article.categories?.slug} ${article.categories?.name}`) && <aside className="rounded border border-amber-300 bg-amber-50 p-4"><h2 className="font-bold">Not a Substitute for Medical Advice</h2><p className="mt-2">This information is for awareness only. Consult a qualified clinician for personal diagnosis, medication, or treatment. Do not stop medication or start treatment solely because of an article.</p>
      {article.reviewers ? <p className="mt-3">Medical review: <Link className="underline" href={`/author/${article.reviewers.id}`}>{authorDisplayName(article.reviewers.name)}</Link> — {article.reviewers.credentials}</p> : <p className="mt-3">Medical review details have not been recorded for this article.</p>}</aside>}
      {article.correction_note && <p className="rounded bg-zinc-50 p-4"><strong>Correction / update note:</strong> {article.correction_note}</p>}
      <div className="flex flex-wrap gap-5 text-red-700 underline"><Link href="/contact-us">Suggest a Correction</Link><Link href="/editorial-policy">Our Reporting Standards</Link></div>
    </footer>
  );
}

