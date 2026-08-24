
import Link from "next/link";
import type { Category } from "@/types";

const socialLinks = [
  {
    label: "Facebook",
    shortLabel: "f",
    href: "https://www.facebook.com/profile.php?id=61585486300184",
  },
  {
    label: "YouTube",
    shortLabel: "YT",
    href: "https://www.youtube.com/@NEWSZ9",
  },
];

const fallbackTopics = [
  "Telugu News",
  "Breaking News",
  "Hyderabad",
  "Politics",
  "Cricket",
  "Business",
  "Technology",
  "Cinema",
  "Health",
  "Education",
];

export function Footer({ categories = [] }: { categories?: Category[] }) {
  const topics = [...new Set([
    ...categories.slice(0, 10).map((category) => category.name),
    ...fallbackTopics,
  ])].slice(0, 14);

  return (
    <footer className="mt-8 bg-white text-zinc-950">
      <div className="border-y border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="mb-3 text-sm font-black uppercase text-zinc-950">
            Trending Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link
                className="rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:border-[var(--color-news-red)] hover:text-[var(--color-news-red)]"
                href={`/search?q=${encodeURIComponent(topic)}`}
                key={topic}
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-news-dark)] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1.2fr_1fr]">
          <div>
            <Link
              className="block w-48 rounded-sm bg-white p-2"
              href="/"
              aria-label="NEWSZ9 home"
            >
              <img
                alt="NEWSZ9"
                className="h-auto w-full"
                height={180}
                src="/newsz9-logo.svg"
                width={720}
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
              Bilingual news for English and Telugu readers, built for fast
              updates, clean reading, and credible discovery.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socialLinks.map((item) => (
                <Link
                  aria-label={item.label}
                  className="grid h-8 min-w-8 place-items-center rounded-sm bg-white/10 px-2 text-xs font-black text-white hover:bg-[var(--color-news-red)]"
                  href={item.href}
                  key={item.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.shortLabel}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase">Categories</h2>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold text-white/75">
              {categories.slice(0, 12).map((category) => (
                <Link
                  className="hover:text-white"
                  href={`/${category.slug}`}
                  key={category.id}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>


        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs font-semibold text-white/65">
            <p>Copyright {new Date().getFullYear()} NEWSZ9. All rights reserved.</p>
            <nav className="flex flex-wrap gap-4">
              <Link className="hover:text-white" href="/about">
                About
              </Link>
              <Link className="hover:text-white" href="/contact">
                Contact
              </Link>
              <Link className="hover:text-white" href="/privacy">
                Privacy
              </Link>
              <Link className="hover:text-white" href="/sitemap.xml">
                Sitemap
              </Link>
              <Link className="hover:text-white" href="/feed.xml">
                RSS
              </Link>
              <span className="text-white/30">|</span>
              <Link className="hover:text-white" href="/admin/login">
                Admin Login
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
