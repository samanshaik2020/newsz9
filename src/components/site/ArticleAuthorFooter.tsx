import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";
import { VerifiedAuthor } from "./VerifiedAuthor";
import Link from "next/link";
import { safeSourceUrl } from "@/lib/editorial";

export function ArticleAuthorFooter({ article }: { article: Article }) {
  return (
    <footer className="mt-10 grid gap-5 border-t border-zinc-200 pt-5 text-base text-zinc-700">
      <div><VerifiedAuthor authorId={article.authors?.role !== "bot" ? article.author_id : null} name={article.authors?.name ?? "సంపాదక బృందం"} />
      {article.authors?.bio && <p className="mt-2">{article.authors.bio}</p>}</div>
      <div className="grid gap-2 text-sm"><p>ప్రచురణ: <time dateTime={article.published_at ?? article.created_at}>{formatDate(article.published_at ?? article.created_at)}</time></p>
      {article.updated_at && Date.parse(article.updated_at) > Date.parse(article.published_at ?? article.created_at) && <p>నవీకరణ: <time dateTime={article.updated_at}>{formatDate(article.updated_at)}</time></p>}</div>
      <p className="text-sm text-zinc-600">చిత్ర మూలం: {article.image_credit || "వినియోగ హక్కుల వివరాలు అందుబాటులో లేవు."}</p>
      {article.sources?.length ? <section><h2 className="text-xl font-bold">ఆధారాలు, మరింత సమాచారం</h2><ul className="mt-3 list-disc space-y-2 pl-5">{article.sources.filter((s) => safeSourceUrl(s.url)).map((source) => <li key={source.url}><a className="text-red-700 underline" href={source.url} rel={article.content_kind === "sponsored" ? "sponsored noopener noreferrer" : "noopener noreferrer"} target="_blank">{source.title}</a></li>)}</ul></section> : article.source_url && safeSourceUrl(article.source_url) ? <a className="text-red-700 underline" href={article.source_url} rel="noopener noreferrer" target="_blank">అసలు ఆధారం</a> : null}
      {article.ai_assisted && <p className="rounded bg-zinc-50 p-4">ఈ కథనం తయారీలో కృత్రిమ మేధ సహాయం ఉపయోగించబడింది. ప్రచురణ బాధ్యత సంపాదక బృందానిదే.</p>}
      {/health|ఆరోగ్య|వైద్య/i.test(`${article.categories?.slug} ${article.categories?.name}`) && <aside className="rounded border border-amber-300 bg-amber-50 p-4"><h2 className="font-bold">వైద్య సలహాకు ప్రత్యామ్నాయం కాదు</h2><p className="mt-2">ఈ సమాచారం అవగాహన కోసం మాత్రమే. వ్యక్తిగత నిర్ధారణ, మందులు, చికిత్స కోసం అర్హతగల వైద్యుడిని సంప్రదించండి. కథనం ఆధారంగా మందులు ఆపవద్దు లేదా కొత్త చికిత్స మొదలుపెట్టవద్దు.</p>
      {article.reviewers ? <p className="mt-3">వైద్య సమీక్ష: <Link className="underline" href={`/author/${article.reviewers.id}`}>{article.reviewers.name}</Link> — {article.reviewers.credentials}</p> : <p className="mt-3">ఈ కథనానికి వైద్య నిపుణుడి సమీక్ష వివరాలు నమోదు కాలేదు.</p>}</aside>}
      {article.correction_note && <p className="rounded bg-zinc-50 p-4"><strong>సవరణ / నవీకరణ గమనిక:</strong> {article.correction_note}</p>}
      <div className="flex flex-wrap gap-5 text-red-700 underline"><Link href="/contact-us">సవరణ సూచించండి</Link><Link href="/editorial-policy">మా వార్తా ప్రమాణాలు</Link></div>
    </footer>
  );
}

