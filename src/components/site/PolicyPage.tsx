import Link from "next/link";
import { policies } from "@/lib/policy-content";
import { POLICY_DATE, trustLinks } from "@/lib/site-config";

export function PolicyPage({ slug }: { slug: string }) {
  const policy = policies[slug];
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${POLICY_DATE}T00:00:00+05:30`));
  return <div className="essential-page mx-auto max-w-3xl px-4 py-10" lang="en">
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-600"><Link href="/">Home</Link> / {policy.title}</nav>
    <article className="article-body">
      <h1 className="text-4xl">{policy.title}</h1>
      <p className="my-4 text-sm text-zinc-500">Last updated: <time dateTime={POLICY_DATE}>{date}</time></p>
      <p>{policy.intro}</p>
      {policy.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p className="mt-3">{section.text}</p></section>)}
    </article>
    <nav aria-label="Related policies" className="mt-10 flex flex-wrap gap-4 border-t pt-6 text-red-700">{trustLinks.filter((link) => link.href !== `/${slug}`).map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
  </div>;
}
