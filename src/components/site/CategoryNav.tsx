"use client";
import { categoryDisplayName } from "@/lib/language";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category, Language } from "@/types";
export function CategoryNav({ categories }: { categories: Category[]; selectedLanguage?: Language }) {
  const pathname = usePathname();
  const order = ["andhrapradesh", "andhra-pradesh", "telangana", "national", "sports", "entertainment", "technology", "health", "business", "politics"];
  const visible = categories.filter((c) => c.language === "te").sort((a, b) => (order.indexOf(a.slug) < 0 ? 99 : order.indexOf(a.slug)) - (order.indexOf(b.slug) < 0 ? 99 : order.indexOf(b.slug)));
  return <nav aria-label="Main news categories" className="flex min-w-0 items-center overflow-x-auto text-lg font-bold">
    {[{ id: "home", slug: "", name: "Home" }, ...visible, { id: "contact", slug: "contact-us", name: "Contact Us" }].map((c) =>
      <Link key={c.id} href={`/${c.slug}`} aria-current={pathname === `/${c.slug}` ? "page" : undefined} className={cn("shrink-0 border-b-3 border-transparent px-4 py-3 hover:border-red-700 hover:text-red-700", pathname === `/${c.slug}` && "border-red-700 text-red-700")}>{categoryDisplayName(c)}</Link>)}
  </nav>;
}
