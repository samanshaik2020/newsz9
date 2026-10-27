import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { trustLinks } from "@/lib/site-config";
import type { Category } from "@/types";
export function Footer({ categories = [] }: { categories?: Category[] }) {
  return <footer className="mt-8 bg-[var(--color-news-dark)] text-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
      <div><Link href="/" aria-label="న్యూస్‌జెడ్‌9 ముఖపుట" className="block w-52 rounded bg-white p-2"><BrandLogo /></Link>
        <p className="mt-4 text-lg leading-8 text-white/80">తెలుగు పాఠకుల కోసం ఆధారాలతో వార్తలు, స్థానిక నేపథ్యం, ఉపయోగకరమైన వివరణలు.</p>
      </div>
      <div><h2 className="text-xl font-bold">వార్తా విభాగాలు</h2><nav aria-label="ఫుటర్ విభాగాలు" className="mt-4 grid grid-cols-2 gap-3 text-white/80">
        <Link href="/latest">తాజా వార్తలు</Link>{categories.filter((c) => c.language === "te").map((c) => <Link className="hover:underline" href={`/${c.slug}`} key={c.id}>{c.name}</Link>)}
      </nav></div>
      <div><h2 className="text-xl font-bold">పారదర్శకత, పాఠక సేవలు</h2><nav lang="en" aria-label="Policies and contact" className="mt-4 grid gap-3 text-white/80 font-sans">{trustLinks.map((link) => <Link className="hover:underline" href={link.href} key={link.href}>{link.label}</Link>)}</nav></div>
    </div>
    <div className="border-t border-white/15"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-4 py-5 text-sm text-white/75">
      <p>© {new Date().getFullYear()} న్యూస్‌జెడ్‌9. అన్ని హక్కులు పరిరక్షితం.</p>
      <nav aria-label="ఇతర లింకులు" className="flex gap-5"><Link href="/sitemap.xml">సైట్ పటం</Link><Link href="/feed.xml">వార్తా ఫీడ్</Link><Link href="/admin/login">నిర్వాహక ప్రవేశం</Link></nav>
    </div></div>
  </footer>;
}
