import { categoryDisplayName } from "@/lib/language";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { trustLinks } from "@/lib/site-config";
import type { Category } from "@/types";
export function Footer({ categories = [] }: { categories?: Category[] }) {
  return <footer className="mt-8 bg-[var(--color-news-dark)] text-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
      <div><Link href="/" aria-label="NEWSZ9 Home" className="block w-52 rounded bg-white p-2"><BrandLogo /></Link>
        <p className="mt-4 text-lg leading-8 text-white/80">Evidence-based news, local context, and useful explanations for Telugu readers.</p>
      </div>
      <div><h2 className="text-xl font-bold">News Categories</h2><nav aria-label="Footer categories" className="mt-4 grid grid-cols-2 gap-3 text-white/80">
        <Link href="/latest">Latest News</Link>{categories.filter((c) => c.language === "te").map((c) => <Link className="hover:underline" href={`/${c.slug}`} key={c.id}>{categoryDisplayName(c)}</Link>)}
      </nav></div>
      <div><h2 className="text-xl font-bold">Transparency and Reader Services</h2><nav lang="en" aria-label="Policies and contact" className="mt-4 grid gap-3 text-white/80 font-sans">{trustLinks.map((link) => <Link className="hover:underline" href={link.href} key={link.href}>{link.label}</Link>)}</nav></div>
    </div>
    <div className="border-t border-white/15"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-4 py-5 text-sm text-white/75">
      <p>© {new Date().getFullYear()} NEWSZ9. All rights reserved.</p>
      <nav aria-label="Other links" className="flex gap-5"><Link href="/sitemap.xml">Sitemap</Link><Link href="/feed.xml">News Feed</Link><Link href="/admin/login">Admin Login</Link></nav>
    </div></div>
  </footer>;
}
