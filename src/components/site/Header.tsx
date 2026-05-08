import {
  ChevronDown,
  CirclePlay,
  CloudSun,
  MapPin,
  Menu,
  MonitorPlay,
  Newspaper,
  Rss,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types";
import { CategoryNav } from "./CategoryNav";
import { LanguageSwitcher } from "./LanguageSwitcher";

const topicToSlug: Record<string, string> = {
  Business: "business",
  India: "national",
  Sports: "sports",
  Tech: "technology",
};

const secondaryTopics = [
  "In The News",
  "Election Results 2026",
  "US Iran War",
  "Formula-E: Berlin",
  "Assembly Elections 2026",
  "West Bengal Election Results",
  "Tamil Nadu Election Results",
];

function formatUpdatedAt() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  })
    .format(now)
    .replace(" ", "")
    .toUpperCase();

  return `${date} | Updated ${time} IST`;
}

export function Header({ categories }: { categories: Category[] }) {
  const categorySlugSet = new Set(categories.map((category) => category.slug));
  const topicHref = (topic: string) => {
    const slug = topicToSlug[topic];
    if (slug && categorySlugSet.has(slug)) return `/${slug}`;
    return `/search?q=${encodeURIComponent(topic)}`;
  };

  return (
    <header className="z-40 bg-white text-zinc-950">
      <div className="border-b border-zinc-200 text-[13px] text-zinc-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center overflow-x-auto">
            <button className="flex h-9 shrink-0 items-center gap-2 border-r border-zinc-200 pr-4 text-left font-medium">
              <span>Edition</span>
              <span className="inline-grid h-3.5 w-5 overflow-hidden border border-zinc-200">
                <span className="bg-orange-500" />
                <span className="bg-white" />
                <span className="bg-green-600" />
              </span>
              <span className="text-zinc-900">IN</span>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <LanguageSwitcher />
            <span className="hidden h-9 shrink-0 items-center border-r border-zinc-200 px-4 md:flex">
              {formatUpdatedAt()}
            </span>
            <Link
              className="hidden h-9 shrink-0 items-center gap-2 px-3 hover:text-red-600 lg:flex"
              href="/search?q=Weather"
            >
              <MapPin className="h-4 w-4 fill-zinc-950 text-zinc-950" aria-hidden="true" />
              <span>Weather</span>
              <CloudSun className="h-5 w-5 text-zinc-950" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              className="hidden h-8 items-center gap-1 rounded-md border border-red-500 px-3 text-[13px] font-bold text-red-600 hover:bg-red-50 sm:inline-flex"
              href="/search?q=ePaper"
            >
              <Newspaper className="h-4 w-4" aria-hidden="true" />
              Read ePaper
            </Link>
            <Link
              className="hidden h-8 items-center rounded-md bg-red-600 px-3 text-[13px] font-bold text-white hover:bg-red-700 md:inline-flex"
              href="/search?q=Subscribe"
            >
              Subscribe To NZ9+
            </Link>
            <Link className="hidden font-medium hover:text-red-600 sm:inline" href="/admin">
              Sign In
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-blue-600 text-xs font-bold text-blue-600">
                f
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-zinc-900 text-xs font-bold text-zinc-950">
                X
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-orange-400 text-orange-500">
                <Rss className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-red-500 text-red-600">
                <CirclePlay className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-blue-500 text-[11px] font-bold text-blue-600">
                in
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-sky-500 text-sky-500">
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-7 sm:py-8">
        <Link className="site-title text-center text-[2.35rem] font-black leading-none text-zinc-950 sm:text-6xl" href="/">
          THE NEWSZ9
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center border-b-2 border-zinc-950 bg-zinc-50">
          <CategoryNav categories={categories} leadingLabel="NZ9" />
          <div className="ml-auto flex shrink-0 items-center gap-2 px-2">
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

      <div className="mx-auto max-w-7xl px-4">
        <nav className="flex items-center gap-7 overflow-x-auto border-b border-zinc-200 py-3 text-sm font-semibold">
          {secondaryTopics.map((topic, index) => (
            <Link
              className={
                index === 0
                  ? "shrink-0 text-red-600"
                  : "shrink-0 text-zinc-950 hover:text-red-600"
              }
              href={topicHref(topic)}
              key={topic}
            >
              {topic}
              {topic === "Formula-E: Berlin" ? (
                <sup className="ml-1 text-[10px] font-bold text-red-600">New</sup>
              ) : null}
            </Link>
          ))}
          <span className="ml-auto hidden shrink-0 rounded border border-zinc-400 px-3 py-1 text-zinc-600 lg:inline-flex">
            Preferred on G
          </span>
        </nav>
      </div>
    </header>
  );
}
