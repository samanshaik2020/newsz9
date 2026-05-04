import Link from "next/link";
import type { Category } from "@/types";

const primaryTopics = [
  { label: "Videos", query: "Videos" },
  { label: "City", query: "City" },
  { label: "India", slug: "national" },
  { label: "Election Results 2026", query: "Election Results 2026" },
  { label: "World", query: "World" },
  { label: "Business", slug: "business" },
  { label: "Tech", slug: "technology" },
  { label: "Cricket", query: "Cricket" },
  { label: "Sports", slug: "sports" },
  { label: "Entertainment", query: "Entertainment" },
  { label: "Astro", query: "Astro" },
];

export function CategoryNav({
  categories,
  leadingLabel = "News",
}: {
  categories: Category[];
  leadingLabel?: string;
}) {
  const slugs = new Set(categories.map((category) => category.slug));

  return (
    <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[15px] font-bold">
      <Link
        className="shrink-0 px-3 py-3 text-zinc-950 hover:text-red-600"
        href="/"
      >
        {leadingLabel}
        <span className="ml-0.5 text-red-600">+</span>
      </Link>
      {primaryTopics.map((topic) => {
        const href =
          topic.slug && slugs.has(topic.slug)
            ? `/${topic.slug}`
            : `/search?q=${encodeURIComponent(topic.query ?? topic.label)}`;

        return (
          <Link
            className="shrink-0 px-3 py-3 text-zinc-950 hover:bg-white hover:text-red-600"
            href={href}
            key={topic.label}
          >
            {topic.label}
          </Link>
        );
      })}
    </nav>
  );
}
