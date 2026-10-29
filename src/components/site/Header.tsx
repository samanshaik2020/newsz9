import { CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import type { Category, Language } from "@/types";
import { CategoryNav } from "./CategoryNav";
export function Header({ categories }: { categories: Category[]; selectedLanguage?: Language }) {
  const today = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "Asia/Kolkata" }).format(new Date());
  return <header className="z-40 bg-white text-zinc-950 shadow-sm">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to main content</a>
    <div className="utility-bar"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-2 text-sm">
      <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden="true" />{today}</span>
      <div className="flex gap-4"><Link href="/about-us">About Us</Link><Link href="/contact-us">Contact Us</Link></div>
    </div></div>
    <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-5 md:grid-cols-[280px_1fr]">
      <Link className="block w-[min(72vw,260px)]" href="/" aria-label="NEWSZ9 Home"><BrandLogo priority /></Link>
      <form action="/search" className="flex overflow-hidden rounded border border-zinc-300">
        <input className="min-h-12 min-w-0 flex-1 px-4 text-lg outline-none focus:ring-2 focus:ring-red-700" name="q" placeholder="Search news and topics" aria-label="Search News" type="search" maxLength={100} />
        <button aria-label="Search" className="grid w-14 place-items-center bg-red-700 text-white hover:bg-red-800" type="submit"><Search aria-hidden="true" /></button>
      </form>
    </div>
    <div className="border-y border-zinc-200 border-b-red-700"><div className="mx-auto max-w-7xl px-4"><CategoryNav categories={categories.filter((c) => c.language === "te")} /></div></div>
  </header>;
}
