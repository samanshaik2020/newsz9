import { Languages, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";
import { CategoryNav } from "./CategoryNav";

export function Header({ categories }: { categories: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link className="flex items-baseline gap-2" href="/">
          <span className="site-title text-3xl font-black tracking-normal text-red-700">
            newsz9
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:inline">
            English | Telugu
          </span>
        </Link>
        <form
          action="/search"
          className="hidden min-w-72 max-w-md flex-1 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 md:flex"
        >
          <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <input
            aria-label="Search articles"
            className="w-full bg-transparent text-sm outline-none"
            name="q"
            placeholder="Search news"
            type="search"
          />
        </form>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/search">
              <Search aria-hidden="true" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            <Languages aria-hidden="true" />
            EN / తెలుగు
          </Button>
        </div>
      </div>
      <CategoryNav categories={categories} />
    </header>
  );
}
