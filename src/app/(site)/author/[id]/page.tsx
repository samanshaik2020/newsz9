import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthorArticles, getPublicAuthor } from "@/lib/data";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import NewsImage from "@/components/NewsImage";
import { SITE_URL } from "@/lib/site-config";
import { isTeluguCopy } from "@/lib/editorial";
import { getImageSrc } from "@/lib/utils";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; const author = await getPublicAuthor(id);
  if (!author) return { title: "రచయిత కనిపించలేదు", robots: { index: false } };
  return { title: `${author.name} | రచయిత పరిచయం`, description: author.bio ?? undefined, alternates: { canonical: `/author/${id}` } };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const author = await getPublicAuthor(id); if (!author) notFound();
  const articles = await getAuthorArticles(id);
  const person = { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: { "@type": "Person", name: author.name, url: `${SITE_URL}/author/${id}`, description: author.bio ?? undefined } };
  return <div className="mx-auto max-w-6xl px-4 py-10 telugu-copy">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
    <p className="text-red-700">రచయిత పరిచయం</p><h1 className="mt-3 text-4xl font-bold">{author.name}</h1>
    {getImageSrc(author.avatar_url) && <div className="mt-5"><NewsImage alt={`${author.name} ఫోటో`} src={getImageSrc(author.avatar_url)!} width={144} height={144} className="h-36 w-36 rounded-full object-cover" /></div>}
    <p className="mt-5 max-w-3xl text-xl leading-9">{author.bio && isTeluguCopy(author.bio) ? author.bio : "ఈ రచయితకు సంబంధించిన పూర్తి పరిచయం ఇంకా అందుబాటులో లేదు."}</p>
    {author.expertise && isTeluguCopy(author.expertise) && <p className="mt-4">రచనా అంశాలు: {author.expertise}</p>}
    {author.credentials && <p className="mt-4">అర్హతలు: {author.credentials}</p>}
    <Link className="mt-5 inline-block text-red-700 underline" href="/contact-us">రచయిత కథనంపై సంప్రదించండి</Link>
    <h2 className="mb-6 mt-10 text-2xl font-bold">ఈ రచయిత కథనాలు</h2>{articles.length ? <ArticleGrid articles={articles} /> : <p>ప్రస్తుతం ప్రచురిత కథనాలు లేవు.</p>}
  </div>;
}
