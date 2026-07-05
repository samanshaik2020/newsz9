import {
  CalendarDays,
  MapPin,
  Menu,
  MonitorPlay,
  Search,
} from "lucide-react";
import Link from "next/link";
import type { Category, Language } from "@/types";
import { CategoryNav } from "./CategoryNav";
import { LanguageSwitcher } from "./LanguageSwitcher";

const socialLinks = [
  { label: "Facebook", shortLabel: "f", href: "#" },
  { label: "Twitter/X", shortLabel: "X", href: "#" },
  { label: "Instagram", shortLabel: "IG", href: "#" },
  { label: "YouTube", shortLabel: "YT", href: "#" },
];

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
  }).format(new Date());
}

export function Header({
  categories,
  selectedLanguage,
}: {
  categories: Category[];
  selectedLanguage?: Language;
}) {
  return (
    <header className="z-40 bg-white text-zinc-950 shadow-sm">
      <div className="utility-bar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs font-semibold">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {getTodayLabel()}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Hyderabad
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-white/75 sm:inline">Follow Us</span>
            <div className="flex items-center gap-1">
              {socialLinks.map((item) => (
                <Link
                  aria-label={item.label}
                  className="grid h-7 min-w-7 place-items-center rounded-sm bg-white/10 px-1.5 text-[10px] font-black text-white hover:bg-white hover:text-[var(--color-news-dark)]"
                  href={item.href}
                  key={item.label}
                >
                  {item.shortLabel}
                </Link>
              ))}
            </div>
            <Link
              className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-sm bg-[var(--color-news-red)] px-3 text-xs font-black text-white hover:bg-red-700"
              href="/search?q=Live"
            >
              <MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" />
              LIVE TV
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-4 md:grid-cols-[240px_minmax(0,1fr)_auto]">
        <Link
          className="block w-[min(72vw,240px)] leading-none"
          href="/"
          aria-label="NEWSZ9 home"
        >
          <img
            alt="NEWSZ9"
            className="block h-auto w-full"
            height={180}
            src="/newsz9-logo.svg"
            width={720}
          />
        </Link>

        <form action="/search" className="flex min-w-0 overflow-hidden rounded-sm border border-zinc-300 bg-white">
          <input
            className="min-h-11 min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-zinc-500"
            name="q"
            placeholder="Search news, topics, live updates"
            type="search"
          />
          <button
            aria-label="Search"
            className="grid h-11 w-12 place-items-center bg-[var(--color-news-red)] text-white hover:bg-red-700"
            type="submit"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>

        <div className="justify-self-start md:justify-self-end">
          <LanguageSwitcher
            categories={categories}
            selectedLanguage={selectedLanguage}
          />
        </div>
      </div>

      <div className="border-y border-zinc-200 border-b-[var(--color-news-red)]">
        <div className="mx-auto flex max-w-7xl items-center px-4">
          <CategoryNav
            categories={categories}
            selectedLanguage={selectedLanguage}
          />
          <button
            aria-label="Open menu"
            className="ml-2 grid h-11 w-11 shrink-0 place-items-center text-zinc-950 hover:bg-zinc-100 hover:text-[var(--color-news-red)]"
            type="button"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
