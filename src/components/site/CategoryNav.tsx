import Link from "next/link";
import type { Category } from "@/types";

export function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-y border-zinc-200 bg-white px-4 py-2 text-sm">
      {categories.map((category) => (
        <Link
          className="whitespace-nowrap rounded px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
          href={`/${category.slug}`}
          key={category.id}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
