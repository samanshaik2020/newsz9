"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, containsTeluguText } from "@/lib/utils";
import type { Category } from "@/types";

export function CategoryNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary categories"
      className="flex min-w-0 flex-1 items-center overflow-x-auto text-[14px] font-black uppercase"
    >
      <Link
        className={cn(
          "shrink-0 border-b-[3px] border-transparent px-4 py-3 text-zinc-950 transition hover:border-[var(--color-news-red)] hover:text-[var(--color-news-red)]",
          pathname === "/" &&
            "border-[var(--color-news-red)] text-[var(--color-news-red)]",
        )}
        href="/"
      >
        Home
      </Link>
      {categories.map((category) => {
        const href = `/${category.slug}`;
        const active = pathname === href;
        const isTelugu = containsTeluguText(category.name);

        return (
          <Link
            className={cn(
              "shrink-0 border-b-[3px] border-transparent px-4 py-3 text-zinc-950 transition hover:border-[var(--color-news-red)] hover:text-[var(--color-news-red)]",
              active &&
                "border-[var(--color-news-red)] text-[var(--color-news-red)]",
              isTelugu && "telugu-copy",
            )}
            href={href}
            key={category.id}
            lang={isTelugu ? "te" : undefined}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
