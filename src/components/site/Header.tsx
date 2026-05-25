import { Menu, MonitorPlay, Search } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types";
import { CategoryNav } from "./CategoryNav";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ categories }: { categories: Category[] }) {
  return (
    <header className="z-40 bg-white text-zinc-950">
      {/* Centered Logo Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:py-4">
        <Link className="block w-[min(72vw,330px)] leading-none sm:w-[390px]" href="/" aria-label="NEWSZ9 home">
          <img
            alt="NEWSZ9"
            className="block h-auto w-full"
            height={180}
            src="/newsz9-logo.svg"
            width={720}
          />
        </Link>
      </div>

      {/* Navigation Category Bar */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center border-b-2 border-zinc-950 bg-zinc-50">
          <CategoryNav categories={categories} leadingLabel="NZ9" />
          <div className="ml-auto flex shrink-0 items-center gap-2 px-2">
            <LanguageSwitcher />
            <Link
              className="hidden h-10 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-zinc-950 hover:border-red-400 sm:flex"
              href="/search?q=Live"
            >
              <MonitorPlay className="h-5 w-5 text-red-600" aria-hidden="true" />
              Live
            </Link>
            <Link
              aria-label="Search"
              className="grid h-10 w-10 place-items-center text-zinc-950 hover:bg-zinc-100"
              href="/search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center text-zinc-950 hover:bg-zinc-100"
              type="button"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
